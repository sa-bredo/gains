
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { Configuration, PlaidApi, PlaidEnvironments } from "npm:plaid@14.0.0";
import * as CryptoJS from "npm:crypto-js@4.1.1";

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
    console.log("Starting exchange-public-token function");
    
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

    // Parse the request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Received request data:", JSON.stringify({
        hasPublicToken: !!requestData.publicToken,
        hasMetadata: !!requestData.metadata
      }));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request body', 
        details: 'The request body could not be parsed as JSON',
        parseError: parseError.message
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const { publicToken, metadata } = requestData;

    if (!publicToken) {
      console.error("Error: Missing public token in request");
      return new Response(JSON.stringify({ 
        error: 'Missing public token', 
        details: 'The request must include a valid Plaid public token' 
      }), { 
        status: 400, 
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
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');

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

    if (!encryptionKey) {
      console.error("Error: Missing encryption key");
      return new Response(JSON.stringify({ 
        error: 'Missing encryption key', 
        details: 'The ENCRYPTION_KEY environment variable is not set' 
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

    try {
      console.log("Exchanging public token for access token");
      const exchangeResponse = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken
      });

      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;

      console.log(`Retrieved access token and item ID. Getting account details`);

      // Get account info
      const accountsResponse = await plaidClient.accountsGet({
        access_token: accessToken
      });

      const accounts = accountsResponse.data.accounts;
      const institutionId = metadata?.institution?.institution_id || null;

      // Get institution details if we have an ID
      let institution = null;
      if (institutionId) {
        console.log(`Getting institution details for ID: ${institutionId}`);
        try {
          const institutionResponse = await plaidClient.institutionsGetById({
            institution_id: institutionId,
            country_codes: ['US'],
          });
          institution = institutionResponse.data.institution;
        } catch (instError) {
          console.warn(`Warning: Could not fetch institution details: ${instError.message}`);
        }
      }

      // Encrypt the access token before storing
      const encryptedAccessToken = CryptoJS.AES.encrypt(accessToken, encryptionKey).toString();

      console.log(`Storing item and account data in database for user: ${user.id}`);

      // Store the Plaid item in the database
      const { data: itemData, error: itemError } = await supabase
        .from('plaid_items')
        .insert({
          user_id: user.id,
          item_id: itemId,
          access_token: encryptedAccessToken,
          institution_id: institutionId,
          institution_name: institution?.name || metadata?.institution?.name || 'Unknown Institution',
        })
        .select()
        .single();

      if (itemError) {
        console.error("Error storing Plaid item:", itemError);
        return new Response(JSON.stringify({ 
          error: 'Database error', 
          details: 'Failed to store Plaid item data',
          dbError: itemError.message,
          code: itemError.code
        }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Store the accounts
      const accountPromises = accounts.map(async (account) => {
        const { error: accountError } = await supabase
          .from('plaid_accounts')
          .insert({
            user_id: user.id,
            item_id: itemId,
            account_id: account.account_id,
            name: account.name,
            mask: account.mask,
            type: account.type,
            subtype: account.subtype,
            available_balance: account.balances.available || 0,
            current_balance: account.balances.current || 0,
            iso_currency_code: account.balances.iso_currency_code,
          });

        if (accountError) {
          console.error(`Error storing account ${account.account_id}:`, accountError);
          return { success: false, error: accountError };
        }
        return { success: true, accountId: account.account_id };
      });

      // Wait for all accounts to be saved
      const accountResults = await Promise.all(accountPromises);
      const failedAccounts = accountResults.filter(result => !result.success);

      if (failedAccounts.length > 0) {
        console.warn(`Warning: ${failedAccounts.length} accounts failed to save`);
      }

      // Trigger initial transaction sync
      console.log(`Triggering initial transaction sync for item: ${itemId}`);
      try {
        const syncResponse = await fetch(`${supabaseUrl}/functions/v1/sync-transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            item_id: itemId,
            access_token: accessToken,
            initial_update: true,
          }),
        });

        if (!syncResponse.ok) {
          const syncError = await syncResponse.text();
          console.warn(`Warning: Initial sync request failed: ${syncError}`);
        } else {
          console.log("Initial sync request successful");
        }
      } catch (syncError) {
        console.warn(`Warning: Error triggering transaction sync: ${syncError.message}`);
      }

      // Return success response with the first account
      const accountToReturn = accounts.length > 0 ? accounts[0] : null;
      return new Response(JSON.stringify({
        success: true,
        message: 'Bank account connected successfully',
        account: {
          id: accountToReturn?.account_id,
          name: accountToReturn?.name || 'Bank Account',
          institution_name: institution?.name || metadata?.institution?.name || 'Financial Institution',
        }
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
      
    } catch (plaidError) {
      // Extract detailed error information from Plaid
      console.error("Plaid API error when exchanging token:", plaidError);
      
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
      
      // Check for common error codes
      let userFriendlyMessage = 'An error occurred while connecting to your bank. Please try again.';
      
      if (errorDetails?.error_code === 'INVALID_PUBLIC_TOKEN') {
        userFriendlyMessage = 'The connection to your bank has expired. Please try again.';
      } else if (errorDetails?.error_code === 'INVALID_INSTITUTION') {
        userFriendlyMessage = 'This financial institution is not currently supported.';
      } else if (errorDetails?.error_code === 'INSTITUTION_DOWN') {
        userFriendlyMessage = 'This financial institution is temporarily unavailable. Please try again later.';
      }
      
      return new Response(JSON.stringify({ 
        error: 'Plaid API error', 
        message: userFriendlyMessage,
        error_code: errorDetails?.error_code || 'UNKNOWN_ERROR',
        error_message: plaidError.message || 'Error connecting to financial institution',
        error_type: errorDetails?.error_type,
        status: plaidError.response?.status || 400,
        details: errorDetails
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  } catch (error) {
    console.error('Unhandled error in exchange-public-token function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: 'An unexpected error occurred while connecting your bank account. Please try again.',
      technicalDetails: error.message || 'Unknown error',
      stack: error.stack ? error.stack.split('\n') : undefined,
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
