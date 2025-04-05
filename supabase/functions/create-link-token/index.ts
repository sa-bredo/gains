
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

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user metadata
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Authenticated user:', user.id)

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

    // Set up the link token request
    console.log('Creating link token')
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
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
