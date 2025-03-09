
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
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  console.log("Received request to connect employee to Slack");
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, { 
      headers: corsHeaders
    });
  }
  
  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log("Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body" 
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
    
    const { employee_id, workspace_id } = body;
    console.log(`Processing connection for employee_id: ${employee_id}, workspace_id: ${workspace_id}`);
    
    if (!employee_id) {
      throw new Error("employee_id is required");
    }
    
    if (!workspace_id) {
      throw new Error("workspace_id is required");
    }
    
    // Get employee information
    console.log(`Fetching employee data for ID: ${employee_id}`);
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("email, integrations")
      .eq("id", employee_id)
      .single();
    
    if (employeeError) {
      console.error("Error fetching employee:", employeeError);
      throw new Error(`Failed to fetch employee: ${employeeError.message}`);
    }
    
    if (!employee.email) {
      console.error("Employee has no email address");
      throw new Error("Employee email address is required for Slack integration");
    }
    
    console.log(`Found employee with email: ${employee.email}`);
    
    // Get workspace token from config
    console.log(`Fetching Slack token for workspace ID: ${workspace_id}`);
    const { data: configData, error: configError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_bot_token")
      .eq("company_id", workspace_id)
      .single();
    
    if (configError) {
      console.error("Error fetching Slack bot token:", configError);
      throw new Error(`Failed to fetch workspace token: ${configError.message}`);
    }
    
    if (!configData || !configData.value) {
      console.error("No Slack bot token found for workspace");
      throw new Error("Slack integration is not configured for this workspace");
    }
    
    const slack_bot_token = configData.value;
    console.log("Retrieved Slack bot token successfully");
    
    // Lookup user in Slack by email - UPDATED to use URL parameter instead of body
    const encodedEmail = encodeURIComponent(employee.email);
    console.log(`Looking up Slack user with email: ${employee.email} (encoded as ${encodedEmail})`);
    
    const slackApiUrl = `https://slack.com/api/users.lookupByEmail?email=${encodedEmail}`;
    console.log(`Making API request to: ${slackApiUrl}`);
    
    const response = await fetch(slackApiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${slack_bot_token}`,
        "Content-Type": "application/json; charset=utf-8",
      }
    });
    
    // Log raw response for debugging
    const responseText = await response.text();
    console.log("Raw Slack API response:", responseText);
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing Slack API response:", e);
      throw new Error("Invalid response from Slack API");
    }
    
    console.log("Parsed Slack API response:", {
      ok: data.ok,
      error: data.error || "none",
      errorDetails: data.errors || data.detail || "none"
    });
    
    if (!data.ok) {
      console.error("Slack API error:", data.error);
      
      // Handle specific error cases
      if (data.error === "invalid_arguments") {
        console.log("Invalid arguments error details:", data.errors || data.detail || "No details provided");
        throw new Error(`Slack API error: ${data.error} - The email address ${employee.email} might not exist in your Slack workspace`);
      }
      
      if (data.error === "users_not_found") {
        throw new Error(`User with email ${employee.email} not found in your Slack workspace`);
      }
      
      throw new Error(`Slack API error: ${data.error}`);
    }
    
    // Store the Slack info in employee's integrations JSON field
    console.log("Storing Slack user information in employee record");
    const slackInfo = {
      slack_user_id: data.user.id,
      slack_username: data.user.real_name || data.user.name,
      slack_email: employee.email,
      slack_connected: true,
      slack_connected_at: new Date().toISOString()
    };
    
    // Initialize or update the integrations object
    const integrations = employee.integrations || {};
    integrations.slack = slackInfo;
    
    console.log("Updating employee record with Slack integration data");
    const { error: updateError } = await supabase
      .from("employees")
      .update({ integrations })
      .eq("id", employee_id);
    
    if (updateError) {
      console.error("Error updating employee record:", updateError);
      throw new Error(`Failed to update employee: ${updateError.message}`);
    }
    
    console.log("Successfully connected employee to Slack");
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          slack_user_id: data.user.id,
          slack_username: data.user.real_name || data.user.name,
        }
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error connecting employee to Slack:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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
