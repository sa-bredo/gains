
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the JWT from the request headers
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

    // Parse the request body to get the institution ID
    const { bank_id, institution_id } = await req.json();
    
    // Use the provided institution ID or fall back to bank_id for backward compatibility
    const selectedInstitutionId = institution_id || bank_id;
    
    if (!selectedInstitutionId) {
      return new Response(
        JSON.stringify({ error: 'Missing institution_id in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Creating GoCardless link for institution: ${selectedInstitutionId}, user: ${user.id}`);

    // Get environment variables for the GoCardless client
    const clientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const clientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: 'GoCardless credentials are not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the correct base URL for redirects
    // First try PUBLIC_URL, then fall back to request origin
    let baseUrl = Deno.env.get('PUBLIC_URL');
    if (!baseUrl) {
      const origin = req.headers.get('origin');
      baseUrl = origin || 'http://localhost:3000'; // Final fallback
    }
    
    console.log(`Using base URL for redirects: ${baseUrl}`);
    
    // Construct the full redirect URL
    const redirectUrl = `${baseUrl}/financials/transactions-gocardless`;
    
    console.log(`Redirect URL: ${redirectUrl}`);

    // Get an access token from GoCardless
    const tokenResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/token/new/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret_id: clientId,
        secret_key: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get GoCardless access token:', tokenResponse.status);
      let errorText = '';
      try {
        errorText = await tokenResponse.text();
      } catch (_) {
        errorText = 'Unknown error';
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to authenticate with GoCardless API', 
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access;

    // Request institution details to verify its validity
    const institutionResponse = await fetch(`https://bankaccountdata.gocardless.com/api/v2/institutions/${selectedInstitutionId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!institutionResponse.ok) {
      console.error('Failed to verify institution:', institutionResponse.status);
      let errorText = '';
      try {
        errorText = await institutionResponse.text();
      } catch (_) {
        errorText = 'Unknown error';
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to verify institution with GoCardless', 
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a requisition
    const requisitionResponse = await fetch('https://bankaccountdata.gocardless.com/api/v2/requisitions/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: selectedInstitutionId,
        reference: user.id,
        user_language: 'en',
      }),
    });

    if (!requisitionResponse.ok) {
      console.error('Failed to create requisition:', requisitionResponse.status);
      let errorText = '';
      try {
        errorText = await requisitionResponse.text();
      } catch (_) {
        errorText = 'Unknown error';
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create bank connection requisition', 
          details: errorText 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requisitionData = await requisitionResponse.json();
    const requisitionId = requisitionData.id;
    const linkUrl = requisitionData.link;

    if (!linkUrl) {
      return new Response(
        JSON.stringify({ 
          error: 'No link URL returned from GoCardless', 
          details: requisitionData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Created GoCardless requisition: ${requisitionId} with link: ${linkUrl}`);

    // Store the requisition in the database
    const { error: insertError } = await supabase
      .from('gocardless_requisitions')
      .insert({
        requisition_id: requisitionId,
        institution_id: selectedInstitutionId,
        user_id: user.id,
        status: 'PENDING',
      });

    if (insertError) {
      console.error('Error storing requisition:', insertError);
      // We don't fail the request if the DB insert fails, just log it
      // The user can still proceed with the bank connection
    }

    return new Response(
      JSON.stringify({ 
        requisition_id: requisitionId,
        redirect_url: linkUrl
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
