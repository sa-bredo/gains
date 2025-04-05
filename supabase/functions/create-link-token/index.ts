import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'https://esm.sh/plaid@12.5.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

console.log('Create Link Token function starting')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    console.log(`Received ${req.method} request`)
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if using a JWT or API key directly
    // If it starts with "Bearer ey" it's likely a JWT
    // Otherwise, it's probably an API key directly
    let serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const isJWT = authHeader.startsWith('Bearer ey');
    
    console.log(`Auth type detected: ${isJWT ? 'JWT' : 'API Key'}`);
    
    let clientId;
    if (isJWT) {
      // Create a Supabase client with the JWT
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        serviceRoleKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      try {
        // Try to get user ID from the token
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser();
        if (userError) {
          console.log('Error getting user from token:', userError);
          // Continue anyway with a random ID since we're using the service role
        } else {
          clientId = userData.user?.id;
          console.log('Found user ID from token:', clientId);
        }
      } catch (authError) {
        console.log('Error authenticating with JWT:', authError);
        // Continue with random ID
      }
    }

    // Check if Plaid environment variables are set
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID')
    const plaidSecret = Deno.env.get('PLAID_SECRET')
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox'
    
    if (!plaidClientId || !plaidSecret) {
      console.error('Missing Plaid credentials')
      return new Response(JSON.stringify({ 
        error: 'Server configuration error', 
        details: 'Missing Plaid API credentials' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Plaid client
    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments[plaidEnv],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': plaidClientId,
          'PLAID-SECRET': plaidSecret,
        },
      },
    })
    const plaidClient = new PlaidApi(plaidConfig)

    // Generate a unique client_user_id to use with Plaid
    // If we don't have a proper user ID, generate a random one
    const clientUserId = clientId || crypto.randomUUID();
    console.log('Using client user ID:', clientUserId);

    // Set up the link token request
    console.log('Creating link token')
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: clientUserId,
      },
      client_name: 'Financial App',
      products: ['transactions'] as Products[],
      country_codes: ['GB'] as CountryCode[], // Only UK banks
      language: 'en',
      webhook: `${Deno.env.get('PUBLIC_URL') || ''}/functions/v1/plaid-webhook`,
    })

    console.log('Link token created successfully')

    // Return the link token to the client
    return new Response(JSON.stringify({ link_token: createTokenResponse.data.link_token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating link token:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      details: JSON.stringify(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
