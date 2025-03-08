
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
    const { employee_id, workspace_id } = await req.json();
    
    if (!employee_id) {
      throw new Error("employee_id is required");
    }
    
    if (!workspace_id) {
      throw new Error("workspace_id is required");
    }
    
    // Get employee information
    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("email, integrations")
      .eq("id", employee_id)
      .single();
    
    if (employeeError) {
      throw new Error(`Failed to fetch employee: ${employeeError.message}`);
    }
    
    // Get workspace token from config
    const { data: configData, error: configError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_bot_token")
      .eq("company_id", workspace_id)
      .single();
    
    if (configError) {
      throw new Error(`Failed to fetch workspace token: ${configError.message}`);
    }
    
    const slack_bot_token = configData.value;
    
    // Lookup user in Slack by email
    const response = await fetch("https://slack.com/api/users.lookupByEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${slack_bot_token}`,
      },
      body: JSON.stringify({
        email: employee.email,
      }),
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }
    
    // Store the Slack info in employee's integrations JSON field
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
    
    const { error: updateError } = await supabase
      .from("employees")
      .update({ integrations })
      .eq("id", employee_id);
    
    if (updateError) {
      throw new Error(`Failed to update employee: ${updateError.message}`);
    }
    
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
