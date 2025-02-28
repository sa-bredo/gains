
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
    const goCardlessClientId = Deno.env.get('GOCARDLESS_CLIENT_ID');
    const goCardlessClientSecret = Deno.env.get('GOCARDLESS_CLIENT_SECRET');
    
    if (!goCardlessClientId || !goCardlessClientSecret) {
      console.error('Missing GoCardless credentials:', { 
        hasClientId: !!goCardlessClientId, 
        hasClientSecret: !!goCardlessClientSecret 
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'GoCardless credentials not configured',
          details: 'Both client ID and client secret must be configured in Supabase secrets'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, you would call the GoCardless API here
    // For now, we're returning a mock redirect URL to demonstrate the flow
    const mockRedirectUrl = "https://gocardless.com/auth/example-institution";
    const requisitionId = `gc_${Math.random().toString(36).substring(2, 10)}`;

    console.log(`Creating mock GoCardless link for user ${user.id} using Client ID: ${goCardlessClientId.substring(0, 5)}...`);
    
    return new Response(
      JSON.stringify({
        redirect_url: mockRedirectUrl,
        requisition_id: requisitionId,
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
