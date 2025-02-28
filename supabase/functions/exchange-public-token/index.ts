
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { Configuration, PlaidApi, PlaidEnvironments } from "npm:plaid@14.0.0";
import CryptoJS from "npm:crypto-js@4.1.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to encrypt sensitive data
function encryptToken(token: string): string {
  const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || '';
  return CryptoJS.AES.encrypt(token, encryptionKey).toString();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Configure Plaid client
    const plaidClientId = Deno.env.get('PLAID_CLIENT_ID');
    const plaidSecret = Deno.env.get('PLAID_SECRET');
    const plaidEnv = Deno.env.get('PLAID_ENV') || 'sandbox';

    if (!plaidClientId || !plaidSecret) {
      return new Response(JSON.stringify({ error: 'Plaid credentials not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

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

    // Get the public token from the request
    const { publicToken, metadata } = await req.json();
    console.log('Exchanging public token with metadata:', { publicToken: '***', metadata });

    // Exchange the public token for an access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Encrypt the access token before storing it
    const encryptedAccessToken = encryptToken(accessToken);

    // Get institution details
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });
    
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: itemResponse.data.item.institution_id,
      country_codes: ['US'],
    });

    const institutionName = institutionResponse.data.institution.name;

    // Store the access token and item ID in the database
    const { data: account, error: insertError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: metadata?.account?.name || institutionName,
        institution_name: institutionName,
        access_token: encryptedAccessToken,
        item_id: itemId,
        status: 'connected',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing account:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store account information' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Trigger initial transaction sync
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        accountId: account.id,
        initialSync: true,
      }),
    });

    return new Response(JSON.stringify({ 
      success: true, 
      account: {
        id: account.id,
        name: account.name,
        institution_name: institutionName,
        status: 'connected'
      }
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
