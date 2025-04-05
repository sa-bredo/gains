
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, PlaidApi, PlaidEnvironments } from 'https://esm.sh/plaid@12.5.0'
import * as CryptoJS from 'https://esm.sh/crypto-js@4.1.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('Exchange Public Token function starting')

// Function to encrypt sensitive data
function encryptData(data: string, key: string): string {
  if (!key) {
    throw new Error('Encryption key is not set');
  }
  return CryptoJS.AES.encrypt(data, key).toString();
}

// Function to decrypt sensitive data
function decryptData(encryptedData: string, key: string): string {
  if (!key) {
    throw new Error('Encryption key is not set');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Get encryption key from environment variables
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      console.error('ENCRYPTION_KEY environment variable is not set');
      return new Response(JSON.stringify({
        error: 'Server configuration error',
        message: 'Missing encryption key configuration',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Authenticated user:', user.id);

    // Parse request body to get the public token
    const { publicToken, metadata } = await req.json();
    if (!publicToken) {
      return new Response(JSON.stringify({ error: 'Missing public token' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Received public token and metadata');
    
    // Initialize Plaid client
    const plaidConfig = new Configuration({
      basePath: PlaidEnvironments[Deno.env.get('PLAID_ENV') || 'sandbox'],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': Deno.env.get('PLAID_CLIENT_ID'),
          'PLAID-SECRET': Deno.env.get('PLAID_SECRET'),
        },
      },
    });
    const plaidClient = new PlaidApi(plaidConfig);

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });
    
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;
    
    console.log('Successfully exchanged public token for access token');

    // Encrypt the access token before storing
    const encryptedAccessToken = encryptData(accessToken, encryptionKey);

    // Get institution data if available in metadata
    const institutionName = metadata?.institution?.name || 'Unknown Institution';
    const institutionId = metadata?.institution?.institution_id || '';

    // Get account data from the metadata
    const accountData = metadata?.accounts?.[0] || metadata?.account || {};
    const accountId = accountData?.id || '';
    const accountName = accountData?.name || 'Account';
    const accountType = accountData?.type || '';
    const accountSubtype = accountData?.subtype || '';
    const accountMask = accountData?.mask || '';

    // Store the account information
    const { data: accountData2, error: accountError } = await supabaseClient
      .from('accounts')
      .insert({
        user_id: user.id,
        item_id: itemId,
        name: accountName,
        institution_name: institutionName,
        access_token: encryptedAccessToken,
      })
      .select('id, name, institution_name')
      .single();

    if (accountError) {
      console.error('Error storing account:', accountError);
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        message: 'Failed to store account information' 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Stored account in database with ID:', accountData2.id);
    
    // Queue a transaction sync to get initial transactions
    try {
      const syncUrl = `${Deno.env.get('PUBLIC_URL') || ''}/functions/v1/sync-transactions`;
      const syncResponse = await fetch(syncUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          account_id: accountData2.id,
        }),
      });
      
      if (!syncResponse.ok) {
        console.error('Error queueing transaction sync:', await syncResponse.text());
      } else {
        console.log('Successfully queued initial transaction sync');
      }
    } catch (syncError) {
      console.error('Error initiating transaction sync:', syncError);
      // Non-fatal error, continue
    }

    // Return success response with account data
    return new Response(JSON.stringify({ 
      success: true,
      account: accountData2
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return new Response(JSON.stringify({ 
      error: 'Plaid API error',
      message: 'An error occurred while connecting to your bank. Please try again.',
      error_code: error.error_code || 'UNKNOWN_ERROR',
      error_message: error.message || String(error),
      status: error.status || 400,
      details: error.details || {}
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
