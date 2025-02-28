
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOCARDLESS_API_URL = "https://bankaccountdata.gocardless.com/api/v2";

serve(async (req) => {
  console.log("Request received to get-gocardless-accounts");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header for user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set up the Supabase client to validate the user session
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Get API credentials
    const clientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const clientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ 
          error: 'GoCardless API credentials not configured', 
          details: 'Missing GOCARDLESS_CLIENT_ID or GOCARDLESS_CLIENT_SECRET environment variables' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get access token from GoCardless
    console.log('Getting access token from GoCardless');
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        secret_id: clientId,
        secret_key: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get access token:', tokenResponse.status);
      let errorDetails;
      try {
        errorDetails = await tokenResponse.text();
      } catch (e) {
        errorDetails = "Could not read response body";
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to authenticate with GoCardless API', 
          status: tokenResponse.status,
          details: errorDetails
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'No access token in response', 
          details: tokenData
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Access token obtained successfully');

    // First, retrieve all requisitions for the user that have been created
    const { data: requisitions, error: requisitionsError } = await supabase
      .from('gocardless_requisitions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['PENDING', 'CR', 'LN', 'GA']); // Include relevant statuses

    if (requisitionsError) {
      console.error('Error fetching requisitions:', requisitionsError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch requisitions from database', 
          details: requisitionsError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${requisitions.length} requisitions for user`);

    // If no requisitions found, return empty accounts
    if (requisitions.length === 0) {
      return new Response(
        JSON.stringify({ accounts: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Array to store all accounts
    const allAccounts = [];
    
    // Process each requisition to get its accounts
    for (const requisition of requisitions) {
      try {
        console.log(`Checking requisition ${requisition.requisition_id}`);
        
        // Check the current status of the requisition
        const requisitionResponse = await fetch(`${GOCARDLESS_API_URL}/requisitions/${requisition.requisition_id}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!requisitionResponse.ok) {
          console.warn(`Failed to get requisition ${requisition.requisition_id} details:`, requisitionResponse.status);
          continue; // Skip this requisition and move to the next one
        }

        const requisitionData = await requisitionResponse.json();
        const currentStatus = requisitionData.status;
        
        console.log(`Requisition ${requisition.requisition_id} status: ${currentStatus}`);
        
        // Update the requisition status in our database if it has changed
        if (currentStatus !== requisition.status) {
          const { error: updateError } = await supabase
            .from('gocardless_requisitions')
            .update({ status: currentStatus })
            .eq('requisition_id', requisition.requisition_id);
            
          if (updateError) {
            console.error(`Error updating requisition status:`, updateError);
          } else {
            console.log(`Updated requisition ${requisition.requisition_id} status to ${currentStatus}`);
          }
        }

        // Skip if requisition is not in the 'LN' (linked) state
        if (currentStatus !== 'LN') {
          console.log(`Skipping requisition ${requisition.requisition_id} as it's not in 'LN' state`);
          continue;
        }

        // Get accounts for this requisition
        if (requisitionData.accounts && requisitionData.accounts.length > 0) {
          console.log(`Requisition has ${requisitionData.accounts.length} accounts`);
          
          // Get institution details for this requisition
          const institutionResponse = await fetch(`${GOCARDLESS_API_URL}/institutions/${requisition.institution_id}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
          });

          let institutionName = "Unknown Institution";
          
          if (institutionResponse.ok) {
            const institutionData = await institutionResponse.json();
            institutionName = institutionData.name;
            console.log(`Institution name: ${institutionName}`);
          } else {
            console.warn(`Failed to get institution details for ${requisition.institution_id}`);
          }

          // Process each account in this requisition
          for (const accountId of requisitionData.accounts) {
            console.log(`Processing account: ${accountId}`);
            
            // Get account details
            const accountResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
              },
            });

            if (!accountResponse.ok) {
              console.warn(`Failed to get account ${accountId} details:`, accountResponse.status);
              continue; // Skip this account
            }

            const accountData = await accountResponse.json();
            
            // Get account balances
            const balancesResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/balances/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
              },
            });

            let balanceAmount = null;
            let currencyCode = "Unknown";
            
            if (balancesResponse.ok) {
              const balancesData = await balancesResponse.json();
              if (balancesData.balances && balancesData.balances.length > 0) {
                const mainBalance = balancesData.balances.find(b => b.balanceType === "closingBooked") || 
                                   balancesData.balances[0];
                balanceAmount = mainBalance.balanceAmount.amount;
                currencyCode = mainBalance.balanceAmount.currency;
              }
            } else {
              console.warn(`Failed to get balances for account ${accountId}`);
            }

            // Check if account already exists in our database
            const { data: existingAccounts, error: existingAccountError } = await supabase
              .from('gocardless_accounts')
              .select('*')
              .eq('account_id', accountId);

            if (existingAccountError) {
              console.error(`Error checking for existing account:`, existingAccountError);
              continue;
            }

            // Generate an account object with all details
            const accountObj = {
              id: accountId,
              name: accountData.display_name || accountData.name || accountData.iban || accountData.bban || `Account ${accountId.slice(-4)}`,
              institution_id: requisition.institution_id,
              institution_name: institutionName,
              currency: currencyCode,
              balance: balanceAmount,
              iban: accountData.iban || null,
              bban: accountData.bban || null,
              bic: accountData.bic || null,
              user_id: user.id,
              requisition_id: requisition.requisition_id
            };

            // Add to our in-memory accounts list
            allAccounts.push(accountObj);

            // If account doesn't exist in DB, insert it
            if (existingAccounts.length === 0) {
              console.log(`Inserting new account ${accountId} into database`);
              
              const { error: insertError } = await supabase
                .from('gocardless_accounts')
                .insert({
                  account_id: accountId,
                  user_id: user.id,
                  institution_id: requisition.institution_id,
                  institution_name: institutionName,
                  requisition_id: requisition.requisition_id,
                  name: accountObj.name,
                  iban: accountObj.iban,
                  bban: accountObj.bban,
                  bic: accountObj.bic,
                  currency: accountObj.currency,
                  balance: accountObj.balance,
                  status: 'active'
                });

              if (insertError) {
                console.error(`Error inserting account:`, insertError);
              } else {
                console.log(`Successfully inserted account ${accountId}`);
              }
            } else {
              console.log(`Account ${accountId} already exists, updating balance`);
              
              // Update account balance and other details if they've changed
              const { error: updateError } = await supabase
                .from('gocardless_accounts')
                .update({
                  name: accountObj.name,
                  iban: accountObj.iban,
                  bban: accountObj.bban,
                  bic: accountObj.bic,
                  currency: accountObj.currency,
                  balance: accountObj.balance,
                  institution_name: institutionName
                })
                .eq('account_id', accountId);

              if (updateError) {
                console.error(`Error updating account:`, updateError);
              } else {
                console.log(`Successfully updated account ${accountId}`);
              }
            }
          }
        } else {
          console.log(`No accounts found for requisition ${requisition.requisition_id}`);
        }
      } catch (error) {
        console.error(`Error processing requisition ${requisition.requisition_id}:`, error);
        // Continue with other requisitions
      }
    }

    // Now that we've processed all requisitions, also get existing accounts from database
    const { data: dbAccounts, error: dbError } = await supabase
      .from('gocardless_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (dbError) {
      console.error('Error fetching accounts from DB:', dbError);
      // Still return the accounts we've processed so far
      return new Response(
        JSON.stringify({ accounts: allAccounts }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine accounts from API and DB, removing duplicates
    const accountMap = new Map();
    
    // First add all accounts we just retrieved
    allAccounts.forEach(account => {
      accountMap.set(account.id, account);
    });
    
    // Then add any accounts from DB that weren't in our API results
    dbAccounts.forEach(dbAccount => {
      if (!accountMap.has(dbAccount.account_id)) {
        accountMap.set(dbAccount.account_id, {
          id: dbAccount.account_id,
          name: dbAccount.name,
          institution_id: dbAccount.institution_id,
          institution_name: dbAccount.institution_name,
          currency: dbAccount.currency,
          balance: dbAccount.balance,
          iban: dbAccount.iban,
          bban: dbAccount.bban,
          bic: dbAccount.bic,
          user_id: dbAccount.user_id,
          requisition_id: dbAccount.requisition_id
        });
      }
    });

    // Convert map to array for response
    const combinedAccounts = Array.from(accountMap.values());
    
    console.log(`Returning ${combinedAccounts.length} accounts to client`);

    return new Response(
      JSON.stringify({ accounts: combinedAccounts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        stack: error.stack,
        details: String(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
