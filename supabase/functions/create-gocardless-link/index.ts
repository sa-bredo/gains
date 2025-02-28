
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOCARDLESS_API_URL = "https://bankaccountdata.gocardless.com/api/v2";

serve(async (req) => {
  console.log("Request received to create-gocardless-link");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set up the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT and get the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Parse the request body
    const requestBody = await req.json();
    
    // Get both bank_id and institution_id from request
    // bank_id is kept for backward compatibility
    const bankId = requestBody.bank_id || '';
    const institutionId = requestBody.institution_id || bankId; // Use bankId as fallback
    
    console.log(`Bank ID: ${bankId}, Institution ID: ${institutionId}`);
    
    if (!institutionId) {
      return new Response(
        JSON.stringify({ error: 'Missing institution_id in request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API credentials
    const clientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const clientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'GoCardless API credentials not configured' }),
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
      const errorText = await tokenResponse.text();
      console.error('Failed to get access token:', tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with GoCardless API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'No access token in response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Access token obtained successfully');

    // Create a requisition (link) to the bank
    const siteHost = Deno.env.get('PUBLIC_URL') || 'https://preview--studio-anatomy-wizard.lovable.app';
    const redirectUrl = `${siteHost}/financials/transactions-gocardless?status=success`;
    
    console.log(`Creating requisition with redirect URL: ${redirectUrl}`);
    console.log(`Using institution ID: ${institutionId}`);
    
    const requisitionResponse = await fetch(`${GOCARDLESS_API_URL}/requisitions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: institutionId,
        reference: user.id,
        agreement: "premium",
        user_language: "EN",
      }),
    });

    if (!requisitionResponse.ok) {
      const errorText = await requisitionResponse.text();
      console.error('Failed to create requisition:', requisitionResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create bank connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requisitionData = await requisitionResponse.json();
    console.log('Requisition created successfully', requisitionData);

    // Return the link URL
    return new Response(
      JSON.stringify({
        redirect_url: requisitionData.link,
        requisition_id: requisitionData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
