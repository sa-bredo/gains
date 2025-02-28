
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";
import { Configuration, PlaidApi, PlaidEnvironments } from "npm:plaid@14.0.0";
import CryptoJS from "npm:crypto-js@4.1.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to decrypt sensitive data
function decryptToken(encryptedToken: string): string {
  const encryptionKey = Deno.env.get('ENCRYPTION_KEY') || '';
  const bytes = CryptoJS.AES.decrypt(encryptedToken, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Get the account ID from the request body
    const { accountId, initialSync = false } = await req.json();

    if (!accountId) {
      return new Response(JSON.stringify({ error: 'Account ID is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get the account from the database
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Decrypt the access token
    const accessToken = decryptToken(account.access_token);

    // Set sync parameters
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Get 30 days of transactions by default for initial sync
    const endDate = new Date();

    if (initialSync) {
      startDate.setDate(startDate.getDate() - 365); // Get up to 1 year of transactions for historical sync
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Syncing transactions for account ${accountId} from ${startDateStr} to ${endDateStr}`);

    // Get transactions from Plaid
    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDateStr,
      end_date: endDateStr,
    });

    const transactions = transactionsResponse.data.transactions;
    console.log(`Retrieved ${transactions.length} transactions from Plaid`);

    // Store transactions in the database
    if (transactions.length > 0) {
      const transactionsToInsert = transactions.map(transaction => ({
        account_id: accountId,
        transaction_id: transaction.transaction_id,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.name,
        merchant_name: transaction.merchant_name || null,
        category: transaction.category ? transaction.category[0] : null,
        pending: transaction.pending,
      }));

      // Insert transactions in batches
      const batchSize = 100;
      let inserted = 0;
      let errors = 0;

      for (let i = 0; i < transactionsToInsert.length; i += batchSize) {
        const batch = transactionsToInsert.slice(i, i + batchSize);
        
        const { error: insertError } = await supabase
          .from('transactions')
          .upsert(batch, { onConflict: 'transaction_id' });

        if (insertError) {
          console.error('Error inserting transactions:', insertError);
          errors += batch.length;
        } else {
          inserted += batch.length;
        }
      }

      console.log(`Inserted/updated ${inserted} transactions, errors: ${errors}`);
    }

    // Update account with last sync timestamp
    await supabase
      .from('accounts')
      .update({
        updated_at: new Date().toISOString(),
        status: 'active',
      })
      .eq('id', accountId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Synced ${transactions.length} transactions`, 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error syncing transactions:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
