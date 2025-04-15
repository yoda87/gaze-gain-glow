
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define the CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting tracker to prevent brute force attacks
const rateLimitTracker = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_ATTEMPTS = 5; // Maximum attempts per period

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header provided' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Get request body
    const { email, code } = await req.json();
    
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Apply rate limiting to prevent brute force attacks
    const clientIp = req.headers.get('CF-Connecting-IP') || 'unknown';
    const rateKey = `${clientIp}:${email}:verify-email`;
    
    const now = Date.now();
    const limitData = rateLimitTracker.get(rateKey);
    
    if (limitData) {
      // Reset count if the period has expired
      if (now - limitData.timestamp > RATE_LIMIT_PERIOD) {
        rateLimitTracker.set(rateKey, { count: 1, timestamp: now });
      } else if (limitData.count >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ 
            error: 'Too many verification attempts. Please try again later.',
            success: false
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } else {
        // Increment counter
        rateLimitTracker.set(rateKey, { 
          count: limitData.count + 1, 
          timestamp: limitData.timestamp 
        });
      }
    } else {
      // First attempt
      rateLimitTracker.set(rateKey, { count: 1, timestamp: now });
    }

    // Check if the code is valid
    const { data, error } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      // Increment failed attempts counter for this IP/email combination
      const currentAttempts = limitData ? limitData.count + 1 : 1;
      rateLimitTracker.set(rateKey, { count: currentAttempts, timestamp: now });
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Code invalide ou expiré' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Update the user's email_verified status in both auth metadata and profiles table
    try {
      // Update profiles table
      await supabaseClient
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', data.user_id);
        
      // Also update user_metadata if possible
      const { error: userUpdateError } = await supabaseClient.auth.admin.updateUserById(
        data.user_id,
        { user_metadata: { email_verified: true } }
      );
      
      if (userUpdateError) {
        console.error('Error updating user metadata:', userUpdateError);
      }
    } catch (updateError) {
      console.error('Error updating verification status:', updateError);
    }
    
    // Delete the verification code to prevent reuse
    await supabaseClient
      .from('verification_codes')
      .delete()
      .eq('email', email);
    
    // Reset the rate limit counter on successful verification
    rateLimitTracker.delete(rateKey);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email vérifié avec succès' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
