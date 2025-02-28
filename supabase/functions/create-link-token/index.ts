
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { Configuration, PlaidApi, PlaidEnvironments, LinkTokenCreateRequest, CountryCode, Products } from "npm:plaid@14.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting create-link-token function");
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Error: No authorization header provided");
      return new Response(JSON.stringify({ 
        error: 'No authorization header', 
        details: 'The request must include an Authorization header with a valid token' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Error: Missing Supabase environment variables", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      return new Response(JSON.stringify({ 
        error: 'Server configuration error', 
        details: 'Supabase connection details are missing' 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from the auth header
    const token = authHeader.replace('Bearer ', '');
    console.log("Getting user from token");
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      console.error("Error: Failed to get user from token", userError);
      return new Response(JSON.stringify({ 
        error: 'Invalid token', 
        details: userError.message,
        statusCode: userError.status || 401
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    if (!user) {
      console.error("Error: No user found with provided token");
      return new Response(JSON.stringify({ 
        error: 'User not found', 
        details: 'No user was found associated with the provided token' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`User authenticated: ${user.id}`);

    // Configure Plaid client
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!plaidClientId || !plaidSecret) {
      console.error("Error: Missing Plaid credentials", { 
        hasClientId: !!plaidClientId, 
        hasSecret: !!plaidSecret 
      });
      return new Response(JSON.stringify({ 
        error: 'Plaid credentials not configured', 
        details: 'The server is missing required Plaid API credentials' 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log(`Configuring Plaid client with environment: ${plaidEnv}`);
    
    const configuration = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': plaidClientId,
          'PLAID-SECRET': plaidSecret,
        },
      },
    });

    const plaidClient = new PlaidApi(configuration);

    // Create a link token
    console.log("Preparing link token request for Plaid");
    
    const publicUrl = Deno.env.get('PUBLIC_URL');
    let webhookUrl = '';
    
    if (publicUrl) {
      webhookUrl = `${publicUrl}/functions/plaid-webhook`;
      console.log(`Setting webhook URL to: ${webhookUrl}`);
    } else {
      console.warn("Warning: PUBLIC_URL not set, webhook will not be configured");
    }
    
    const linkTokenRequest: LinkTokenCreateRequest = {
      user: {
        client_user_id: user.id,
      },
      client_name: 'BankSync',
      products: ['transactions'] as Products[],
      country_codes: ['US'] as CountryCode[],
      language: 'en',
    };
    
    // Only add webhook if we have a public URL
    if (webhookUrl) {
      linkTokenRequest.webhook = webhookUrl;
    }

    try {
      console.log("Calling Plaid API to create link token");
      const response = await plaidClient.linkTokenCreate(linkTokenRequest);
      console.log('Link token created successfully');
      
      return new Response(JSON.stringify(response.data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    } catch (plaidError) {
      // Extract detailed error information from Plaid
      console.error("Plaid API error when creating link token:", plaidError);
      
      let errorDetails = {};
      try {
        // Attempt to get structured error details from Plaid
        if (plaidError.response && plaidError.response.data) {
          errorDetails = plaidError.response.data;
          console.error("Plaid error details:", JSON.stringify(errorDetails));
        }
      } catch (parseError) {
        console.error("Error parsing Plaid error response:", parseError);
      }
      
      return new Response(JSON.stringify({ 
        error: 'Plaid API error', 
        message: plaidError.message || 'Error creating link token',
        status: plaidError.response?.status || 500,
        details: errorDetails,
        requestData: {
          user_id: user.id,
          client_name: linkTokenRequest.client_name,
          products: linkTokenRequest.products,
          environment: plaidEnv,
          has_webhook: !!linkTokenRequest.webhook
        }
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  } catch (error) {
    console.error('Unhandled error in create-link-token function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message || 'An unexpected error occurred',
      stack: error.stack ? error.stack.split('\n') : undefined,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
