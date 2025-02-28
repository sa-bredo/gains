
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Updated GoCardless API URL
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

    // Get access token
    const tokenRequestBody = {
      secret_id: clientId,
      secret_key: clientSecret
    };
    
    console.log('Requesting access token from GoCardless API');
    
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(tokenRequestBody),
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    
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
      console.error('No access token in response');
      return new Response(
        JSON.stringify({ 
          error: 'No access token in response', 
          details: JSON.stringify(tokenData)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get available banks (institutions)
    // Filter for UK banks if requested
    const country = req.url.includes('?country=gb') ? 'gb' : '';
    const endpoint = country 
      ? `${GOCARDLESS_API_URL}/institutions/?country=${country.toUpperCase()}`
      : `${GOCARDLESS_API_URL}/institutions/`;
    
    console.log(`Fetching institutions from ${endpoint}`);
    
    const institutionsResponse = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    const institutionsResponseText = await institutionsResponse.text();
    console.log('Institutions response status:', institutionsResponse.status);
    
    if (!institutionsResponse.ok) {
      console.error('Failed to retrieve institutions:', {
        status: institutionsResponse.status,
        response: institutionsResponseText
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve institutions',
          details: institutionsResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let institutionsData;
    try {
      institutionsData = JSON.parse(institutionsResponseText);
    } catch (parseError) {
      console.error('Failed to parse institutions response:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid institutions response format',
          details: institutionsResponseText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format and return the institutions data
    const banks = institutionsData.map(institution => ({
      id: institution.id,
      name: institution.name,
      logo: institution.logo,
      countries: institution.countries || [],
      bic: institution.bic || null,
      transaction_total_days: institution.transaction_total_days
    }));

    // Sort banks alphabetically by name
    banks.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Returning ${banks.length} banks`);
    
    return new Response(
      JSON.stringify({ banks }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching banks:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
