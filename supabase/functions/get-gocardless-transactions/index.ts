
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let params;
    try {
      params = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required parameters
    const { accountId, startDate, endDate } = params;
    if (!accountId) {
      return new Response(
        JSON.stringify({ error: 'Account ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // For demonstration purposes, we'll return mock data
    // In a real implementation, you would use the GoCardless API to fetch transactions
    console.log(`Fetching transactions for account ${accountId} from ${startDate} to ${endDate}`);

    const generateMockTransactions = (accountId) => {
      const transactions = [];
      const categories = [
        'Groceries', 
        'Transportation', 
        'Entertainment', 
        'Dining', 
        'Shopping', 
        'Utilities',
        'Healthcare'
      ];
      
      const merchants = [
        'Sainsbury\'s', 
        'TFL', 
        'Netflix', 
        'Pret A Manger', 
        'Amazon', 
        'British Gas',
        'NHS'
      ];
      
      // Parse the start and end dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Generate a random number of transactions (between 10 and 30)
      const numTransactions = Math.floor(Math.random() * 20) + 10;
      
      for (let i = 0; i < numTransactions; i++) {
        // Generate a random date between start and end
        const transactionDate = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );
        
        // Random category and merchant
        const categoryIndex = Math.floor(Math.random() * categories.length);
        const merchantIndex = Math.floor(Math.random() * merchants.length);
        
        // Random amount between -200 and 1000 (negative for expenses, positive for income)
        let amount;
        const isIncome = Math.random() < 0.2; // 20% chance of income
        if (isIncome) {
          amount = Math.round(Math.random() * 900) + 100; // 100 to 1000
        } else {
          amount = -1 * (Math.round(Math.random() * 180) + 20); // -20 to -200
        }
        
        // Random pending status (10% chance)
        const isPending = Math.random() < 0.1;
        
        transactions.push({
          id: `gc_tx_${Math.random().toString(36).substring(2, 10)}`,
          account_id: accountId,
          date: transactionDate.toISOString().split('T')[0],
          description: `${merchants[merchantIndex]} Payment`,
          amount: amount,
          currency: 'GBP',
          category: categories[categoryIndex],
          merchant_name: merchants[merchantIndex],
          pending: isPending,
          transaction_id: `gc_transaction_${Math.random().toString(36).substring(2, 10)}`
        });
      }
      
      // Sort transactions by date (newest first)
      return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const mockTransactions = generateMockTransactions(accountId);
    
    return new Response(
      JSON.stringify({
        transactions: mockTransactions
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting GoCardless transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
