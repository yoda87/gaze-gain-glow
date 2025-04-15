
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define the CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate a random 5-digit code
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Rate limiting tracker to prevent abuse
const rateLimitTracker = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_ATTEMPTS = 5; // Maximum attempts per hour

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
    const { email, purpose = 'email-verification' } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
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

    // Apply rate limiting to prevent abuse
    const clientIp = req.headers.get('CF-Connecting-IP') || 'unknown';
    const rateKey = `${clientIp}:${email}:${purpose}`;
    
    const now = Date.now();
    const limitData = rateLimitTracker.get(rateKey);
    
    if (limitData) {
      // Reset count if the period has expired
      if (now - limitData.timestamp > RATE_LIMIT_PERIOD) {
        rateLimitTracker.set(rateKey, { count: 1, timestamp: now });
      } else if (limitData.count >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again later.',
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

    // Find user ID if email exists
    let userId = null;
    const { data: userData, error: userError } = await supabaseClient.auth
      .admin.listUsers({ 
        filters: { email }
      });
    
    if (userError) {
      console.error('Error finding user:', userError);
    } else if (userData.users.length > 0) {
      // User found
      userId = userData.users[0].id;
    } else {
      // If purpose is password reset and we can't find the user, return error
      if (purpose === 'password-reset') {
        return new Response(
          JSON.stringify({ 
            error: 'Utilisateur non trouvé',
            success: false,
            message: 'Aucun utilisateur trouvé avec cette adresse email'
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
    }

    // Generate a new verification code
    const verificationCode = generateVerificationCode();
    
    // Expiration time (30 minutes)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 30);
    
    // Delete any existing codes for this email to prevent code accumulation
    await supabaseClient
      .from('verification_codes')
      .delete()
      .eq('email', email);
      
    // Save to verification_codes table in Supabase
    const { error: insertError } = await supabaseClient
      .from('verification_codes')
      .insert({ 
        email,
        code: verificationCode, 
        expires_at: expirationTime.toISOString(),
        user_id: userId || '00000000-0000-0000-0000-000000000000' // placeholder if userId not available
      });
      
    if (insertError) {
      throw insertError;
    }

    // In real implementation, you would send an email with the verification code
    // For now, we'll just log it
    console.log(`${purpose} code for ${email}: ${verificationCode}`);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error sending verification code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
