
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOCARDLESS_API_URL = "https://bankaccountdata.gocardless.com/api/v2";

serve(async (req) => {
  console.log("Request received to get-gocardless-institutions");
  
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

    // Parse query parameters for country filter
    const url = new URL(req.url);
    const country = url.searchParams.get('country') || 'gb'; // Default to GB if not specified
    
    console.log(`Getting institutions for country: ${country}`);

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

    // Get institutions from GoCardless
    console.log(`Fetching institutions from GoCardless for country: ${country}`);
    
    // Construct the institutions URL with country filter
    const institutionsUrl = `${GOCARDLESS_API_URL}/institutions/?country=${country.toUpperCase()}`;
    
    const institutionsResponse = await fetch(institutionsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!institutionsResponse.ok) {
      console.error('Failed to get institutions:', institutionsResponse.status);
      let errorDetails;
      try {
        errorDetails = await institutionsResponse.text();
      } catch (e) {
        errorDetails = "Could not read response body";
      }
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch institutions from GoCardless', 
          status: institutionsResponse.status,
          details: errorDetails
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const institutionsData = await institutionsResponse.json();
    
    console.log(`Fetched ${institutionsData.length} institutions from GoCardless`);
    
    // Transform the data to match our expected format
    const banks = institutionsData.map((institution: any) => ({
      id: institution.id,
      name: institution.name,
      logo: institution.logo,
      countries: [country.toUpperCase()],
      bic: institution.bic || null
    }));

    // Return the institutions data
    return new Response(
      JSON.stringify({ banks }),
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
