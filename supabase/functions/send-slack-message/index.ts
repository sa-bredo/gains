
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
    const { 
      recipients, 
      recipient_type, 
      message, 
      workspace_id,
      user_id
    } = await req.json();
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("recipients array is required");
    }
    
    if (!recipient_type || !["employee", "channel", "group"].includes(recipient_type)) {
      throw new Error("Invalid recipient_type. Must be 'employee', 'channel', or 'group'");
    }
    
    if (!message) {
      throw new Error("message is required");
    }
    
    if (!workspace_id) {
      throw new Error("workspace_id is required");
    }
    
    // Get the slack bot token from config
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
    
    // For each recipient, send a message
    const results = await Promise.all(
      recipients.map(async (recipient) => {
        try {
          let slackUserId = recipient;
          
          // If recipient type is employee, get the slack user id from employee record
          if (recipient_type === "employee") {
            const { data: employee, error: employeeError } = await supabase
              .from("employees")
              .select("integrations")
              .eq("id", recipient)
              .single();
            
            if (employeeError) {
              throw new Error(`Failed to fetch employee: ${employeeError.message}`);
            }
            
            const slackInfo = employee.integrations?.slack;
            if (!slackInfo || !slackInfo.slack_user_id) {
              throw new Error(`Employee ${recipient} is not connected to Slack`);
            }
            
            slackUserId = slackInfo.slack_user_id;
          }
          
          // Open a direct message channel or use the channel ID
          let channelId = slackUserId;
          if (recipient_type === "employee") {
            const imResponse = await fetch("https://slack.com/api/conversations.open", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${slack_bot_token}`
              },
              body: JSON.stringify({
                users: slackUserId
              })
            });
            
            const imData = await imResponse.json();
            if (!imData.ok) {
              throw new Error(`Failed to open DM channel: ${imData.error}`);
            }
            
            channelId = imData.channel.id;
          }
          
          // Send the message
          const chatResponse = await fetch("https://slack.com/api/chat.postMessage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${slack_bot_token}`
            },
            body: JSON.stringify({
              channel: channelId,
              text: message
            })
          });
          
          const chatData = await chatResponse.json();
          if (!chatData.ok) {
            throw new Error(`Failed to send message: ${chatData.error}`);
          }
          
          // Store the message in our database
          const { error: insertError } = await supabase
            .from("messages")
            .insert({
              type: "slack",
              recipient_id: recipient,
              recipient_type,
              content: message,
              status: "sent",
              sent_by: user_id,
              sent_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error("Error storing message:", insertError);
          }
          
          return {
            recipient,
            success: true,
            timestamp: chatData.ts
          };
        } catch (error) {
          console.error(`Error sending message to ${recipient}:`, error);
          
          // Store the failed message
          try {
            await supabase
              .from("messages")
              .insert({
                type: "slack",
                recipient_id: recipient,
                recipient_type,
                content: message,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
                sent_by: user_id
              });
          } catch (dbError) {
            console.error("Error storing failed message:", dbError);
          }
          
          return {
            recipient,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      })
    );
    
    return new Response(
      JSON.stringify({ 
        success: results.every(r => r.success),
        results
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error processing slack message request:", error);
    
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
