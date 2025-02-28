
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

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
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract webhook data
    const webhookData = await req.json();
    console.log('Received Plaid webhook:', JSON.stringify(webhookData));

    const webhookType = webhookData.webhook_type;
    const webhookCode = webhookData.webhook_code;
    const itemId = webhookData.item_id;

    // Log the webhook event
    await supabase
      .from('webhook_logs')
      .insert({
        source: 'plaid',
        event_type: `${webhookType}.${webhookCode}`,
        payload: webhookData,
      });

    // Find the account associated with this item_id
    const { data: accounts, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('item_id', itemId);

    if (accountError || !accounts || accounts.length === 0) {
      console.error('Account not found for item_id:', itemId);
      return new Response(JSON.stringify({ error: 'Account not found' }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const accountId = accounts[0].id;

    // Handle different webhook types
    if (webhookType === 'TRANSACTIONS') {
      if (['INITIAL_UPDATE', 'HISTORICAL_UPDATE', 'DEFAULT_UPDATE'].includes(webhookCode)) {
        // Trigger transaction sync
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sync-transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            accountId,
            initialSync: webhookCode === 'HISTORICAL_UPDATE',
          }),
        });
      } else if (webhookCode === 'TRANSACTIONS_REMOVED') {
        // Handle removed transactions
        const removedTransactionIds = webhookData.removed_transactions || [];
        
        if (removedTransactionIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .in('transaction_id', removedTransactionIds);
          
          if (deleteError) {
            console.error('Error deleting transactions:', deleteError);
          } else {
            console.log(`Deleted ${removedTransactionIds.length} transactions`);
          }
        }
      }
    } else if (webhookType === 'ITEM' && webhookCode === 'ERROR') {
      // Update account status to error
      await supabase
        .from('accounts')
        .update({
          status: 'error',
        })
        .eq('id', accountId);
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
