
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Define the CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Enhanced rate limiting tracker to prevent brute force attacks
const rateLimitTracker = new Map<string, { count: number, timestamp: number, consecutiveFailures: number }>();
const RATE_LIMIT_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_ATTEMPTS = 5; // Maximum attempts per period
const LOCKOUT_THRESHOLD = 10; // Number of consecutive failures before extended lockout
const EXTENDED_LOCKOUT_PERIOD = 60 * 60 * 1000; // 1 hour in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'No authorization header provided', success: false }),
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
    const { email, code, purpose = 'email-verification' } = await req.json();
    
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required', success: false }),
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
        JSON.stringify({ error: 'Invalid email format', success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get IP and device info for better tracking
    const clientIp = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = req.headers.get('User-Agent') || 'unknown';
    const rateKey = `${clientIp}:${email}:verify`;
    
    const now = Date.now();
    const limitData = rateLimitTracker.get(rateKey);
    
    // Check for extended lockout due to too many consecutive failures
    if (limitData && limitData.consecutiveFailures >= LOCKOUT_THRESHOLD) {
      const lockoutExpiry = limitData.timestamp + EXTENDED_LOCKOUT_PERIOD;
      if (now < lockoutExpiry) {
        const minutesRemaining = Math.ceil((lockoutExpiry - now) / (60 * 1000));
        return new Response(
          JSON.stringify({
            error: `Account temporarily locked due to multiple failed attempts. Try again in ${minutesRemaining} minutes.`,
            success: false,
            locked: true
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } else {
        // Reset after lockout period expires
        rateLimitTracker.set(rateKey, { count: 1, timestamp: now, consecutiveFailures: 0 });
      }
    } else if (limitData) {
      // Standard rate limiting check
      if (now - limitData.timestamp > RATE_LIMIT_PERIOD) {
        // Reset if period expired
        rateLimitTracker.set(rateKey, { count: 1, timestamp: now, consecutiveFailures: limitData.consecutiveFailures || 0 });
      } else if (limitData.count >= MAX_ATTEMPTS) {
        // Too many attempts within the period
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
          timestamp: limitData.timestamp,
          consecutiveFailures: limitData.consecutiveFailures || 0
        });
      }
    } else {
      // First attempt
      rateLimitTracker.set(rateKey, { count: 1, timestamp: now, consecutiveFailures: 0 });
    }

    // Log verification attempt (could be stored in database for audit)
    console.log(`Verification attempt for ${email}, purpose: ${purpose}, IP: ${clientIp}`);

    // Check if the code is valid
    const { data, error } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      // Increment failed attempts counter and track consecutive failures
      const currentData = rateLimitTracker.get(rateKey) || { count: 1, timestamp: now, consecutiveFailures: 0 };
      const consecutiveFailures = currentData.consecutiveFailures + 1;
      
      rateLimitTracker.set(rateKey, { 
        count: currentData.count, 
        timestamp: currentData.timestamp,
        consecutiveFailures: consecutiveFailures
      });
      
      // Check if we should apply extended lockout
      if (consecutiveFailures >= LOCKOUT_THRESHOLD) {
        return new Response(
          JSON.stringify({ 
            error: 'Account temporarily locked due to multiple failed attempts. Try again later.',
            success: false,
            locked: true
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
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
    
    // Handle different verification purposes
    if (purpose === 'email-verification') {
      // Update the user's email_verified status
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', data.user_id);
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
      }
    }
    
    // Delete the verification code to prevent reuse
    await supabaseClient
      .from('verification_codes')
      .delete()
      .eq('id', data.id);
    
    // Reset the rate limit counter and consecutive failures on successful verification
    rateLimitTracker.delete(rateKey);
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Code vérifié avec succès' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error('Error verifying code:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
