
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
  console.log("Received request to initiate Slack OAuth");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      } 
    });
  }
  
  try {
    const { company_id } = await req.json();
    console.log(`Processing OAuth initiation for company_id: ${company_id}`);
    
    if (!company_id) {
      throw new Error("company_id is required");
    }
    
    // Get Slack credentials from config table
    console.log("Fetching Slack client ID from config");
    const { data: clientIdData, error: clientIdError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_client_id")
      .eq("company_id", company_id)
      .maybeSingle();
    
    if (clientIdError) {
      console.error("Error fetching Slack client ID:", clientIdError);
      throw new Error(`SLACK_CLIENT_ID not configured in config table: ${clientIdError.message}`);
    }
    
    if (!clientIdData || !clientIdData.value) {
      console.error("No Slack Client ID found for company:", company_id);
      throw new Error("Slack Client ID not found in configuration");
    }
    
    console.log("Fetching Slack redirect URI from config");
    const { data: redirectUriData, error: redirectUriError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_redirect_uri")
      .eq("company_id", company_id)
      .maybeSingle();
    
    if (redirectUriError) {
      console.error("Error fetching Slack redirect URI:", redirectUriError);
      throw new Error(`SLACK_REDIRECT_URI not configured in config table: ${redirectUriError.message}`);
    }
    
    if (!redirectUriData || !redirectUriData.value) {
      console.error("No Slack Redirect URI found for company:", company_id);
      throw new Error("Slack Redirect URI not found in configuration");
    }
    
    const SLACK_CLIENT_ID = clientIdData.value;
    const REDIRECT_URI = redirectUriData.value;
    
    console.log("Retrieved credentials:", {
      client_id: SLACK_CLIENT_ID ? "present" : "missing",
      redirect_uri: REDIRECT_URI
    });
    
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
    console.log(`Generated OAuth URL with redirect to: ${REDIRECT_URI}`);
    
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
