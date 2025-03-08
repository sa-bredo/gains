
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SLACK_CLIENT_ID = Deno.env.get("SLACK_CLIENT_ID");
const SLACK_CLIENT_SECRET = Deno.env.get("SLACK_CLIENT_SECRET");
const REDIRECT_URI = Deno.env.get("SLACK_REDIRECT_URI");

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
    if (!SLACK_CLIENT_ID) {
      throw new Error("SLACK_CLIENT_ID not configured");
    }
    
    if (!REDIRECT_URI) {
      throw new Error("REDIRECT_URI not configured");
    }
    
    const { company_id } = await req.json();
    
    if (!company_id) {
      throw new Error("company_id is required");
    }
    
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
