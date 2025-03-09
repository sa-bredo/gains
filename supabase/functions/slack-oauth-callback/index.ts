
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
  console.log("Slack OAuth callback received request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      } 
    });
  }
  
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  
  console.log("Request parameters:", { 
    code: code ? "present" : "missing", 
    state: state ? "present" : "missing",
    error: error || "none"
  });
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Slack Integration</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          padding: 30px;
          margin-top: 40px;
        }
        .success { color: #2E7D32; }
        .error { color: #C62828; }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        button {
          background-color: #4A154B;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 20px;
          transition: background-color 0.3s;
        }
        button:hover {
          background-color: #611f64;
        }
        .details {
          margin-top: 20px;
          text-align: left;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          white-space: pre-wrap;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
  `;
  
  try {
    if (error) {
      console.error(`Slack OAuth error: ${error}`);
      throw new Error(`Slack OAuth error: ${error}`);
    }
    
    if (!code || !state) {
      console.error("Missing code or state parameter");
      throw new Error("Missing code or state parameter");
    }
    
    // Parse the state parameter
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
      console.log("Parsed state data:", stateData);
    } catch (err) {
      console.error("Invalid state parameter:", err);
      throw new Error("Invalid state parameter");
    }
    
    const { company_id } = stateData;
    
    if (!company_id) {
      console.error("Invalid state data - missing company_id");
      throw new Error("Invalid state data - missing company_id");
    }
    
    // Get Slack credentials from config table
    console.log("Fetching Slack credentials for company:", company_id);
    
    const { data: clientIdData, error: clientIdError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_client_id")
      .eq("company_id", company_id)
      .maybeSingle();
    
    if (clientIdError) {
      console.error("Failed to fetch Slack Client ID:", clientIdError);
      throw new Error(`Slack Client ID not configured: ${clientIdError.message}`);
    }
    
    if (!clientIdData || !clientIdData.value) {
      console.error("No Slack Client ID found for company:", company_id);
      throw new Error("Slack Client ID not found");
    }
    
    const { data: clientSecretData, error: clientSecretError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_client_secret")
      .eq("company_id", company_id)
      .maybeSingle();
    
    if (clientSecretError) {
      console.error("Failed to fetch Slack Client Secret:", clientSecretError);
      throw new Error(`Slack Client Secret not configured: ${clientSecretError.message}`);
    }
    
    if (!clientSecretData || !clientSecretData.value) {
      console.error("No Slack Client Secret found for company:", company_id);
      throw new Error("Slack Client Secret not found");
    }
    
    const { data: redirectUriData, error: redirectUriError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_redirect_uri")
      .eq("company_id", company_id)
      .maybeSingle();
    
    if (redirectUriError) {
      console.error("Failed to fetch Slack Redirect URI:", redirectUriError);
      throw new Error(`Slack Redirect URI not configured: ${redirectUriError.message}`);
    }
    
    if (!redirectUriData || !redirectUriData.value) {
      console.error("No Slack Redirect URI found for company:", company_id);
      throw new Error("Slack Redirect URI not found");
    }
    
    const SLACK_CLIENT_ID = clientIdData.value;
    const SLACK_CLIENT_SECRET = clientSecretData.value;
    const REDIRECT_URI = redirectUriData.value;
    
    console.log("Retrieved credentials:", {
      client_id: SLACK_CLIENT_ID ? "present" : "missing",
      client_secret: SLACK_CLIENT_SECRET ? "present" : "missing",
      redirect_uri: REDIRECT_URI
    });
    
    // Exchange the code for an access token
    console.log("Exchanging code for token with Slack API");
    
    const tokenParams = new URLSearchParams({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    });
    
    console.log("Token request URL:", "https://slack.com/api/oauth.v2.access");
    console.log("Token request params:", tokenParams.toString());
    
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });
    
    if (!tokenResponse.ok) {
      const statusText = tokenResponse.statusText;
      const responseBody = await tokenResponse.text();
      console.error("Slack API error:", {
        status: tokenResponse.status,
        statusText,
        body: responseBody
      });
      throw new Error(`Failed to exchange code for token: HTTP ${tokenResponse.status} ${statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log("Slack token response:", {
      ok: tokenData.ok,
      error: tokenData.error || "none",
      team: tokenData.team ? { id: tokenData.team.id, name: tokenData.team.name } : "missing"
    });
    
    if (!tokenData.ok) {
      console.error("Slack API error:", tokenData.error);
      throw new Error(`Failed to exchange code for token: ${tokenData.error}`);
    }
    
    // Store the bot token and workspace info in the config table
    console.log("Storing configuration data in Supabase");
    const configItems = [
      {
        company_id,
        key: "slack_workspace_id",
        display_name: "Slack Workspace ID",
        value: tokenData.team.id
      },
      {
        company_id,
        key: "slack_bot_token",
        display_name: "Slack Bot Token",
        value: tokenData.access_token
      },
      {
        company_id,
        key: "slack_app_id",
        display_name: "Slack App ID",
        value: tokenData.app_id
      },
      {
        company_id,
        key: "slack_workspace_name",
        display_name: "Slack Workspace Name",
        value: tokenData.team.name
      },
      {
        company_id,
        key: "slack_team_url",
        display_name: "Slack Team URL",
        value: `https://${tokenData.team.domain}.slack.com`
      },
      {
        company_id,
        key: "slack_connected_at",
        display_name: "Slack Connected At",
        value: new Date().toISOString()
      }
    ];
    
    // Insert or update each config item one at a time
    for (const configItem of configItems) {
      console.log(`Storing config item: ${configItem.key}`);
      
      // First, check if the item exists
      const { data: existingItem, error: fetchError } = await supabase
        .from("config")
        .select("id")
        .eq("company_id", company_id)
        .eq("key", configItem.key)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error fetching existing config (${configItem.key}):`, fetchError);
      }
      
      let upsertError;
      
      if (existingItem) {
        // Update existing item
        const { error } = await supabase
          .from("config")
          .update({ value: configItem.value })
          .eq("id", existingItem.id);
        
        upsertError = error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from("config")
          .insert(configItem);
        
        upsertError = error;
      }
      
      if (upsertError) {
        console.error(`Failed to store Slack config (${configItem.key}):`, upsertError);
        throw new Error(`Failed to store Slack config (${configItem.key}): ${upsertError.message}`);
      }
    }
    
    // Generate success response
    console.log("Integration successful, sending success response");
    html += `
      <div class="card">
        <div class="icon success">✓</div>
        <h1>Successfully Connected to Slack</h1>
        <p>Your workspace <strong>${tokenData.team.name}</strong> has been successfully connected to our application.</p>
        <p>You can now close this window and return to the application.</p>
        <button onclick="window.close()">Close Window</button>
      </div>
    `;
    
  } catch (error) {
    console.error("Slack OAuth callback error:", error);
    
    // Generate error response
    html += `
      <div class="card">
        <div class="icon error">✗</div>
        <h1>Connection Failed</h1>
        <p>We encountered an error connecting to your Slack workspace:</p>
        <p style="color: #C62828;">${error instanceof Error ? error.message : "Unknown error"}</p>
        <p>Please try again or contact support if the issue persists.</p>
        <button onclick="window.close()">Close Window</button>
        <div class="details">
          <strong>Error Details:</strong>
          ${error instanceof Error ? error.stack || error.message : JSON.stringify(error)}
        </div>
      </div>
    `;
  }
  
  html += `
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: {
      "Content-Type": "text/html", // Properly set content type to render HTML
      ...corsHeaders
    },
  });
});
