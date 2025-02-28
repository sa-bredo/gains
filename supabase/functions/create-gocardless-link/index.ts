
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GoCardless Nordigen API URLs - they're using Nordigen for Open Banking
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

    // Get GoCardless credentials from environment variables
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
          details: 'Both client ID and client secret must be configured in Supabase secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using GoCardless credentials - Client ID exists:', !!clientId, 'Secret exists:', !!clientSecret);

    // Step 1: Get JWT access token from GoCardless using client credentials
    console.log('Obtaining access token from GoCardless...');
    
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

    // Log the raw response for debugging
    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response:', tokenResponseText);

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to obtain GoCardless access token',
          details: tokenResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = JSON.parse(tokenResponseText);
    const accessToken = tokenData.access;
    
    if (!accessToken) {
      console.error('No access token returned from GoCardless');
      return new Response(
        JSON.stringify({ error: 'No access token returned from GoCardless' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully obtained GoCardless access token');

    // Step 2: Create an End User Agreement (required for creating requisitions)
    const agreementResponse = await fetch(`${GOCARDLESS_API_URL}/agreements/enduser/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        max_historical_days: 90,
        access_valid_for_days: 90,
        access_scope: ["balances", "details", "transactions"]
      }),
    });

    const agreementResponseText = await agreementResponse.text();
    console.log('Agreement response status:', agreementResponse.status);
    console.log('Agreement response:', agreementResponseText);

    if (!agreementResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create GoCardless end user agreement',
          details: agreementResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const agreementData = JSON.parse(agreementResponseText);
    
    // Step 3: Create a requisition that links the user to their bank
    // The redirect URL is where the user will be sent after connecting their bank
    const appUrl = Deno.env.get('PUBLIC_URL') || 'http://localhost:5173';
    const redirectUrl = `${appUrl}/financials/transactions-gocardless?status=success`;
    
    // For demo purposes, we'll use Santander UK as our institution
    // In a production app, you would let users choose their bank
    const santanderUkId = "SANTANDER_BANK_PL";
    
    console.log('Creating new requisition with GoCardless...');
    const requisitionResponse = await fetch(`${GOCARDLESS_API_URL}/requisitions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: santanderUkId,
        reference: user.id.substring(0, 20), // Using the user's ID as a reference
        agreement: agreementData.id,
        user_language: 'EN', // Default to English
      }),
    });

    const requisitionResponseText = await requisitionResponse.text();
    console.log('Requisition response status:', requisitionResponse.status);
    console.log('Requisition response:', requisitionResponseText);

    if (!requisitionResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create GoCardless requisition',
          details: requisitionResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requisitionData = JSON.parse(requisitionResponseText);
    console.log('Requisition created successfully:', requisitionData.id);

    // Return the link URL to the client
    return new Response(
      JSON.stringify({
        redirect_url: requisitionData.link,
        requisition_id: requisitionData.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating GoCardless link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
