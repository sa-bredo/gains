
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
      console.error('Missing GoCardless credentials');
      return new Response(
        JSON.stringify({ error: 'GoCardless credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Get access token
    const tokenRequestBody = {
      secret_id: clientId,
      secret_key: clientSecret
    };
    
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to obtain access token');
      return new Response(
        JSON.stringify({ error: 'Failed to obtain GoCardless access token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access;

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

    if (!requisitionsResponse.ok) {
      console.error('Failed to retrieve requisitions');
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve requisitions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requisitionsData = await requisitionsResponse.json();
    
    // Filter requisitions by user ID in reference field
    // This is a simple approach for demo purposes
    const userRequisitions = requisitionsData.results.filter(
      req => req.reference && req.reference.includes(user.id.substring(0, 20))
    );

    // For demo purposes, if there are no requisitions, return mock data
    if (userRequisitions.length === 0) {
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
      if (requisition.status !== 'LN' || !requisition.accounts || requisition.accounts.length === 0) {
        continue; // Skip incomplete requisitions
      }

      for (const accountId of requisition.accounts) {
        // Get account details
        const accountDetailsResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/details/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!accountDetailsResponse.ok) {
          console.warn(`Failed to get details for account ${accountId}`);
          continue;
        }

        const accountDetails = await accountDetailsResponse.json();

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
          const balances = balancesData.balances;
          if (balances && balances.length > 0) {
            const availableBalance = balances.find(b => b.balanceType === "closingAvailable");
            if (availableBalance) {
              balance = parseFloat(availableBalance.balanceAmount.amount);
              currency = availableBalance.balanceAmount.currency;
            }
          }
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
