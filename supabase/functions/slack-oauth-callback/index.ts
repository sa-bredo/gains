
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SLACK_CLIENT_ID = Deno.env.get("SLACK_CLIENT_ID");
const SLACK_CLIENT_SECRET = Deno.env.get("SLACK_CLIENT_SECRET");
const REDIRECT_URI = Deno.env.get("SLACK_REDIRECT_URI");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  
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
      </style>
    </head>
    <body>
  `;
  
  try {
    if (error) {
      throw new Error(`Slack OAuth error: ${error}`);
    }
    
    if (!code || !state) {
      throw new Error("Missing code or state parameter");
    }
    
    if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET || !REDIRECT_URI) {
      throw new Error("Missing required environment variables");
    }
    
    // Parse the state parameter
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch (err) {
      throw new Error("Invalid state parameter");
    }
    
    const { company_id } = stateData;
    
    if (!company_id) {
      throw new Error("Invalid state data - missing company_id");
    }
    
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      throw new Error(`Failed to exchange code for token: ${tokenData.error}`);
    }
    
    // Store the bot token and workspace info in the config table
    const { error: dbError } = await supabase
      .from("config")
      .upsert([
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
      ]);
    
    if (dbError) {
      throw new Error(`Failed to store Slack token: ${dbError.message}`);
    }
    
    // Generate success response
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
      </div>
    `;
  }
  
  html += `
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
});
