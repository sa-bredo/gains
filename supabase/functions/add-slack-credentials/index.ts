
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
  console.log("Received request to add Slack credentials");
  
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
    console.log("Processing request to add Slack credentials");
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify({
      company_id: requestBody.company_id,
      client_id: requestBody.client_id ? "provided" : "missing",
      client_secret: requestBody.client_secret ? "provided" : "missing",
      redirect_uri: requestBody.redirect_uri
    }));
    
    const { company_id, client_id, client_secret, redirect_uri } = requestBody;
    
    if (!company_id) {
      console.error("Missing company_id in request");
      throw new Error("company_id is required");
    }
    
    if (!client_id || !client_secret || !redirect_uri) {
      console.error("Missing required credentials in request");
      throw new Error("client_id, client_secret, and redirect_uri are all required");
    }
    
    console.log(`Processing credentials for company_id: ${company_id}`);
    
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
    
    // Process each config item one at a time
    for (const item of configItems) {
      console.log(`Processing config item: ${item.key}`);
      
      // First try to delete any existing entry
      const { data: existingItem, error: fetchError } = await supabase
        .from("config")
        .select("id")
        .eq("company_id", company_id)
        .eq("key", item.key)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`Error fetching existing config (${item.key}):`, fetchError);
      }
      
      if (existingItem) {
        console.log(`Found existing config for ${item.key}, deleting it first`);
        const { error: deleteError } = await supabase
          .from("config")
          .delete()
          .eq("id", existingItem.id);
        
        if (deleteError) {
          console.error(`Error deleting existing config (${item.key}):`, deleteError);
        }
      }
      
      // Now insert the new item
      console.log(`Inserting new config item: ${item.key}`);
      const { error: insertError } = await supabase
        .from("config")
        .insert(item);
      
      if (insertError) {
        console.error(`Failed to insert config (${item.key}):`, insertError);
        throw new Error(`Failed to store config (${item.key}): ${insertError.message}`);
      }
    }
    
    console.log("Successfully stored all Slack credentials");
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
