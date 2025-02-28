
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GoCardless Nordigen API URLs
const GOCARDLESS_API_URL = "https://ob.nordigen.com/api/v2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get GoCardless credentials
    const clientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const clientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('Missing GoCardless credentials:', { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      return new Response(
        JSON.stringify({ 
          error: 'GoCardless credentials not configured',
          details: 'Both client ID and client secret must be configured'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get access token
    const tokenRequestBody = {
      secret_id: clientId,
      secret_key: clientSecret
    };
    
    console.log('Making token request to GoCardless API:', {
      url: `${GOCARDLESS_API_URL}/token/new/`,
      method: 'POST',
      bodyKeys: Object.keys(tokenRequestBody),
      clientIdLength: clientId.length,
      clientSecretPrefix: clientSecret.substring(0, 3) + '...',
    });
    
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    // Get the raw response text for detailed error information
    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers));
    console.log('Token response body:', tokenResponseText);

    if (!tokenResponse.ok) {
      console.error('Failed to obtain access token:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: tokenResponseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to obtain GoCardless access token',
          details: tokenResponseText,
          status: tokenResponse.status,
          statusText: tokenResponse.statusText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the token data
    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
      console.log('Successfully obtained access token');
    } catch (parseError) {
      console.error('Failed to parse token response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid token response format',
          details: tokenResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const accessToken = tokenData.access;
    if (!accessToken) {
      console.error('No access token in response:', tokenData);
      return new Response(
        JSON.stringify({ 
          error: 'No access token in response',
          details: JSON.stringify(tokenData)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get the user's requisitions
    // In a real app, you would query your database to find requisitions for this user
    // For now, we'll just fetch all requisitions and filter by the user ID in the reference
    const requisitionsResponse = await fetch(`${GOCARDLESS_API_URL}/requisitions/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    // Log detailed information about the requisitions request
    const requisitionsResponseText = await requisitionsResponse.text();
    console.log('Requisitions response status:', requisitionsResponse.status);
    console.log('Requisitions response body:', requisitionsResponseText);

    if (!requisitionsResponse.ok) {
      console.error('Failed to retrieve requisitions:', {
        status: requisitionsResponse.status,
        response: requisitionsResponseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve requisitions',
          details: requisitionsResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let requisitionsData;
    try {
      requisitionsData = JSON.parse(requisitionsResponseText);
    } catch (parseError) {
      console.error('Failed to parse requisitions response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid requisitions response format',
          details: requisitionsResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter requisitions by user ID in reference field
    // This is a simple approach for demo purposes
    const userRequisitions = requisitionsData.results.filter(
      req => req.reference && req.reference.includes(user.id.substring(0, 20))
    );
    
    console.log(`Found ${userRequisitions.length} requisitions for user ${user.id.substring(0, 10)}...`);

    // For demo purposes, if there are no requisitions, return mock data
    if (userRequisitions.length === 0) {
      console.log('No requisitions found, returning mock data');
      // Return mock accounts for demonstration
      return new Response(
        JSON.stringify({
          accounts: [
            {
              id: "gc_acc_123456",
              name: "Current Account",
              institution_name: "Mock Bank",
              status: "active",
              balance: 2542.63,
              currency: "GBP",
              account_type: "current"
            },
            {
              id: "gc_acc_789012",
              name: "Savings Account",
              institution_name: "Mock Bank",
              status: "active",
              balance: 15720.45,
              currency: "GBP",
              account_type: "savings"
            }
          ]
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 3: Get account data for each requisition
    const accounts = [];
    for (const requisition of userRequisitions) {
      console.log(`Processing requisition ${requisition.id} with status ${requisition.status}`);
      
      if (requisition.status !== 'LN' || !requisition.accounts || requisition.accounts.length === 0) {
        console.log(`Skipping requisition ${requisition.id} - status: ${requisition.status}, has accounts: ${!!requisition.accounts}`);
        continue; // Skip incomplete requisitions
      }

      for (const accountId of requisition.accounts) {
        console.log(`Fetching details for account ${accountId}`);
        
        // Get account details
        const accountDetailsResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/details/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!accountDetailsResponse.ok) {
          console.warn(`Failed to get details for account ${accountId}:`, {
            status: accountDetailsResponse.status,
            response: await accountDetailsResponse.text()
          });
          continue;
        }

        const accountDetails = await accountDetailsResponse.json();
        console.log(`Got details for account ${accountId}:`, {
          name: accountDetails.account.name,
          type: accountDetails.account.cashAccountType
        });

        // Get account balances
        const accountBalancesResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/balances/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        let balance = 0;
        let currency = "GBP";

        if (accountBalancesResponse.ok) {
          const balancesData = await accountBalancesResponse.json();
          console.log(`Got balances for account ${accountId}:`, {
            count: balancesData.balances ? balancesData.balances.length : 0
          });
          
          const balances = balancesData.balances;
          if (balances && balances.length > 0) {
            const availableBalance = balances.find(b => b.balanceType === "closingAvailable");
            if (availableBalance) {
              balance = parseFloat(availableBalance.balanceAmount.amount);
              currency = availableBalance.balanceAmount.currency;
              console.log(`Found available balance: ${balance} ${currency}`);
            } else {
              console.log('No closing available balance found, available types:', 
                balances.map(b => b.balanceType).join(', '));
            }
          }
        } else {
          console.warn(`Failed to get balances for account ${accountId}:`, {
            status: accountBalancesResponse.status,
            response: await accountBalancesResponse.text()
          });
        }

        // Format the account data
        accounts.push({
          id: accountId,
          name: accountDetails.account.name || 'Account',
          institution_name: requisition.institution_id,
          status: "active",
          balance: balance,
          currency: currency,
          account_type: accountDetails.account.cashAccountType?.toLowerCase() || "unknown"
        });
      }
    }

    console.log(`Returning ${accounts.length} accounts`);
    
    return new Response(
      JSON.stringify({ accounts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
