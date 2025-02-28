
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated GoCardless API URL based on the error message
const GOCARDLESS_API_URL = "https://bankaccountdata.gocardless.com/api/v2";

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

    // Parse request body
    const { accountId, startDate, endDate } = await req.json();
    
    if (!accountId) {
      return new Response(
        JSON.stringify({ error: 'Account ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a mock account ID and return mock data
    if (accountId.startsWith('gc_acc_')) {
      // Generate random transactions for demo purposes
      const mockTransactions = generateMockTransactions(accountId, startDate, endDate);
      
      return new Response(
        JSON.stringify({ transactions: mockTransactions }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    
    console.log('Token request URL:', `${GOCARDLESS_API_URL}/token/new/`);
    
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    // Log detailed information about the token request
    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response body:', tokenResponseText);

    if (!tokenResponse.ok) {
      console.error('Failed to obtain access token:', {
        status: tokenResponse.status,
        response: tokenResponseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to obtain GoCardless access token',
          details: tokenResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
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

    // Step 2: Get transactions for the specified account
    console.log(`Fetching transactions for account ${accountId}`);
    
    const transactionsResponse = await fetch(`${GOCARDLESS_API_URL}/accounts/${accountId}/transactions/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    // Log detailed information about the transactions request
    const transactionsResponseText = await transactionsResponse.text();
    console.log('Transactions response status:', transactionsResponse.status);
    console.log('Transactions response body preview:', 
      transactionsResponseText.length > 200 ? 
      transactionsResponseText.substring(0, 200) + '...' : 
      transactionsResponseText);

    if (!transactionsResponse.ok) {
      console.error('Failed to retrieve transactions:', {
        status: transactionsResponse.status,
        response: transactionsResponseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve transactions',
          details: transactionsResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let transactionsData;
    try {
      transactionsData = JSON.parse(transactionsResponseText);
    } catch (parseError) {
      console.error('Failed to parse transactions response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid transactions response format',
          details: transactionsResponseText.substring(0, 500)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Filter and format transactions
    const formattedTransactions = [];
    const transactions = transactionsData.transactions?.booked || [];
    const pendingTransactions = transactionsData.transactions?.pending || [];
    
    console.log(`Processing ${transactions.length} booked transactions and ${pendingTransactions.length} pending transactions`);
    
    // Process booked transactions
    for (const transaction of transactions) {
      if (!startDate || !endDate || isDateInRange(transaction.bookingDate, startDate, endDate)) {
        formattedTransactions.push({
          id: `gc_tx_${generateRandomId()}`,
          account_id: accountId,
          date: transaction.bookingDate,
          description: transaction.remittanceInformationUnstructured || 
                      transaction.additionalInformation || 
                      'Transaction',
          amount: parseFloat(transaction.transactionAmount.amount) * 
                 (transaction.creditDebitIndicator === 'DBIT' ? -1 : 1),
          currency: transaction.transactionAmount.currency,
          category: categorizeTransaction(transaction.remittanceInformationUnstructured),
          merchant_name: extractMerchantName(transaction.remittanceInformationUnstructured),
          pending: false,
          transaction_id: `gc_transaction_${generateRandomId()}`
        });
      }
    }
    
    // Process pending transactions
    for (const transaction of pendingTransactions) {
      if (!startDate || !endDate || isDateInRange(transaction.valueDate, startDate, endDate)) {
        formattedTransactions.push({
          id: `gc_tx_${generateRandomId()}`,
          account_id: accountId,
          date: transaction.valueDate,
          description: transaction.remittanceInformationUnstructured || 
                      transaction.additionalInformation || 
                      'Pending Transaction',
          amount: parseFloat(transaction.transactionAmount.amount) * 
                 (transaction.creditDebitIndicator === 'DBIT' ? -1 : 1),
          currency: transaction.transactionAmount.currency,
          category: categorizeTransaction(transaction.remittanceInformationUnstructured),
          merchant_name: extractMerchantName(transaction.remittanceInformationUnstructured),
          pending: true,
          transaction_id: `gc_transaction_${generateRandomId()}`
        });
      }
    }
    
    // Sort transactions by date (newest first)
    formattedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log(`Returning ${formattedTransactions.length} formatted transactions`);
    
    return new Response(
      JSON.stringify({ transactions: formattedTransactions }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to check if a date is within a range
function isDateInRange(dateStr, startDateStr, endDateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  return date >= startDate && date <= endDate;
}

// Helper function to categorize a transaction based on description
function categorizeTransaction(description) {
  if (!description) return "Uncategorized";
  
  const categories = {
    "Dining": ["restaurant", "café", "cafe", "coffee", "food", "takeaway", "take-away", "take away", "meal", "pret", "manger"],
    "Groceries": ["supermarket", "grocery", "groceries", "tesco", "sainsbury", "asda", "morrisons", "waitrose", "lidl", "aldi"],
    "Transportation": ["transport", "train", "bus", "cab", "taxi", "uber", "lyft", "tube", "tfl", "oyster"],
    "Shopping": ["shop", "store", "purchase", "amazon", "ebay", "asos", "clothing", "retail"],
    "Utilities": ["utility", "utilities", "electricity", "gas", "water", "internet", "phone", "mobile", "broadband"],
    "Healthcare": ["health", "doctor", "pharmacy", "medicine", "dental", "dentist", "medical", "healthcare", "nhs"],
    "Entertainment": ["entertainment", "cinema", "movie", "theatre", "concert", "event", "subscription", "netflix", "spotify"]
  };
  
  const lowerDescription = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerDescription.includes(keyword))) {
      return category;
    }
  }
  
  return "Uncategorized";
}

// Helper function to extract merchant name from transaction description
function extractMerchantName(description) {
  if (!description) return "";
  
  // Common UK merchants to look for in transaction descriptions
  const merchants = [
    "Tesco", "Sainsbury's", "Asda", "Morrisons", "Waitrose", "Lidl", "Aldi", 
    "Amazon", "eBay", "Asos", "Next", "M&S", "John Lewis",
    "TFL", "Uber", "British Gas", "EDF", "Thames Water", "BT", "Sky", "Virgin Media",
    "Netflix", "Spotify", "Apple", "Google", "Microsoft",
    "NHS", "Boots", "Superdrug", "Holland & Barrett",
    "Pret A Manger", "Costa", "Starbucks", "Greggs", "Nando's", "Wagamama"
  ];
  
  for (const merchant of merchants) {
    if (description.includes(merchant)) {
      return merchant;
    }
  }
  
  // If no known merchant found, extract first few words
  const words = description.split(' ');
  return words.slice(0, 2).join(' ');
}

// Generate a random ID for transactions
function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

// Generate mock transactions for demo purposes
function generateMockTransactions(accountId, startDate, endDate) {
  const transactions = [];
  
  // Parse start and end dates
  const start = startDate ? new Date(startDate) : new Date();
  start.setDate(start.getDate() - 30); // Default to 30 days ago
  
  const end = endDate ? new Date(endDate) : new Date();
  
  // Merchants for UK transactions
  const merchants = [
    "Sainsbury's", "Tesco", "TFL", "Amazon", "Netflix", 
    "British Gas", "NHS", "Pret A Manger"
  ];
  
  // Categories for transactions
  const categories = [
    "Groceries", "Transportation", "Shopping", "Utilities", 
    "Healthcare", "Dining", "Entertainment"
  ];
  
  // Generate dates between start and end
  const dates = [];
  let currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Generate 20-30 random transactions
  const numTransactions = Math.floor(Math.random() * 10) + 20;
  
  for (let i = 0; i < numTransactions; i++) {
    // Select random date
    const randomDateIndex = Math.floor(Math.random() * dates.length);
    const date = dates[randomDateIndex].toISOString().split('T')[0];
    
    // Select random merchant
    const randomMerchantIndex = Math.floor(Math.random() * merchants.length);
    const merchant = merchants[randomMerchantIndex];
    
    // Select random category that makes sense for the merchant
    let category;
    switch (merchant) {
      case "Sainsbury's":
      case "Tesco":
        category = "Groceries";
        break;
      case "TFL":
        category = "Transportation";
        break;
      case "Amazon":
        category = "Shopping";
        break;
      case "Netflix":
        category = "Entertainment";
        break;
      case "British Gas":
        category = "Utilities";
        break;
      case "NHS":
        category = "Healthcare";
        break;
      case "Pret A Manger":
        category = "Dining";
        break;
      default:
        const randomCategoryIndex = Math.floor(Math.random() * categories.length);
        category = categories[randomCategoryIndex];
    }
    
    // Generate random amount (-200 to +1000)
    let amount;
    if (Math.random() < 0.8) {
      // 80% chance of being a debit (negative amount)
      amount = -(Math.random() * 195 + 5); // Between -5 and -200
      amount = Math.round(amount); // Round to whole numbers for simplicity
    } else {
      // 20% chance of being a credit (positive amount)
      amount = Math.random() * 995 + 5; // Between 5 and 1000
      amount = Math.round(amount); // Round to whole numbers for simplicity
    }
    
    // 10% chance of being a pending transaction
    const isPending = Math.random() < 0.1;
    
    transactions.push({
      id: `gc_tx_${generateRandomId()}`,
      account_id: accountId,
      date: date,
      description: `${merchant} Payment`,
      amount: amount,
      currency: "GBP",
      category: category,
      merchant_name: merchant,
      pending: isPending,
      transaction_id: `gc_transaction_${generateRandomId()}`
    });
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return transactions;
}
