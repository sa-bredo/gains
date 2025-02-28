
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Step 1: Obtain an access token
    console.log('Obtaining access token from GoCardless...');
    const tokenResponse = await fetch(`${GOCARDLESS_API_URL}/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GoCardless token error:', tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to obtain GoCardless access token',
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    if (!accessToken) {
      console.error('No access token returned from GoCardless');
      return new Response(
        JSON.stringify({ error: 'No access token returned from GoCardless' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully obtained GoCardless access token');

    // Step 2: Create a new requisition
    // The redirect URL is where the user will be sent after connecting their bank
    const appUrl = Deno.env.get('PUBLIC_URL') || 'http://localhost:5173';
    const redirectUrl = `${appUrl}/financials/transactions-gocardless?status=success`;
    
    console.log('Creating new requisition with GoCardless...');
    const requisitionResponse = await fetch(`${GOCARDLESS_API_URL}/requisitions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirect: redirectUrl,
        institution_id: '', // Empty for now, user will select their bank in the GoCardless UI
        reference: user.id, // Using the user's ID as a reference
        agreement: tokenData.agreement, // Using the agreement from the token response if provided
        user_language: 'EN', // Default to English
      }),
    });

    if (!requisitionResponse.ok) {
      const errorText = await requisitionResponse.text();
      console.error('GoCardless requisition error:', requisitionResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create GoCardless requisition',
          details: errorText
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requisitionData = await requisitionResponse.json();
    console.log('Requisition created successfully:', requisitionData.id);

    // Step 3: Store the requisition details in Supabase for later retrieval
    try {
      const { error: insertError } = await supabase
        .from('gocardless_requisitions')
        .insert({
          user_id: user.id,
          requisition_id: requisitionData.id,
          status: requisitionData.status,
          created_at: new Date().toISOString(),
          access_token: accessToken,
          access_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        });

      if (insertError) {
        console.error('Failed to store requisition details:', insertError);
        // Continue anyway, as this is not critical
      }
    } catch (dbError) {
      console.error('Database error storing requisition:', dbError);
      // If the table doesn't exist yet, log it but don't fail the request
    }

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
