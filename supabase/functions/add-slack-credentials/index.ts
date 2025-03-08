
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
    const { company_id, client_id, client_secret, redirect_uri } = await req.json();
    
    if (!company_id) {
      throw new Error("company_id is required");
    }
    
    if (!client_id || !client_secret || !redirect_uri) {
      throw new Error("client_id, client_secret, and redirect_uri are all required");
    }
    
    // Create config items for Slack credentials
    const configItems = [
      {
        company_id,
        key: "slack_client_id",
        display_name: "Slack Client ID",
        value: client_id
      },
      {
        company_id,
        key: "slack_client_secret",
        display_name: "Slack Client Secret",
        value: client_secret
      },
      {
        company_id,
        key: "slack_redirect_uri",
        display_name: "Slack Redirect URI",
        value: redirect_uri
      }
    ];
    
    // Insert or update each config item
    for (const item of configItems) {
      const { error } = await supabase
        .from("config")
        .upsert(item, {
          onConflict: "company_id,key"
        });
        
      if (error) {
        throw new Error(`Failed to store config (${item.key}): ${error.message}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Slack credentials stored successfully" 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error storing Slack credentials:", error);
    
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
