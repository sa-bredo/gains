
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { company_id } = await req.json();
    
    if (!company_id) {
      throw new Error("company_id is required");
    }
    
    // Get Slack credentials from config table
    const { data: clientIdData, error: clientIdError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_client_id")
      .eq("company_id", company_id)
      .single();
    
    if (clientIdError) {
      throw new Error("SLACK_CLIENT_ID not configured in config table");
    }
    
    const { data: redirectUriData, error: redirectUriError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_redirect_uri")
      .eq("company_id", company_id)
      .single();
    
    if (redirectUriError) {
      throw new Error("SLACK_REDIRECT_URI not configured in config table");
    }
    
    const SLACK_CLIENT_ID = clientIdData.value;
    const REDIRECT_URI = redirectUriData.value;
    
    // Generate a state parameter to validate the OAuth callback
    const state = btoa(JSON.stringify({ company_id, timestamp: Date.now() }));
    
    // Construct the OAuth URL
    const scopes = [
      "chat:write",
      "users:read",
      "users:read.email",
      "im:write",
      "channels:read"
    ].join(",");
    
    const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    
    return new Response(
      JSON.stringify({ url: slackOAuthUrl }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error initiating Slack OAuth:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { 
        status: 400, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
