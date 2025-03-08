
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";

interface SlackConnectionButtonProps {
  employeeId: string;
  isConnected?: boolean;
  onConnectionChange?: () => void;
}

export function SlackConnectionButton({ 
  employeeId, 
  isConnected = false,
  onConnectionChange
}: SlackConnectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentCompany } = useCompany();

  const handleConnectToSlack = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (!currentCompany?.id) {
        toast.error("No workspace selected. Please select a workspace first.");
        return;
      }
      
      // Check if the workspace is connected to Slack
      const { data: configData, error: configError } = await supabase
        .from("config")
        .select("value")
        .eq("key", "slack_bot_token")
        .eq("company_id", currentCompany.id)
        .maybeSingle(); // Using maybeSingle instead of single
      
      if (configError && configError.code !== 'PGRST116') {
        console.error("Error checking Slack configuration:", configError);
        toast.error("Failed to check Slack configuration. Please try again.");
        return;
      }
      
      if (!configData?.value) {
        toast.error("This workspace is not connected to Slack. Please ask an admin to set up the Slack integration.");
        return;
      }
      
      // Call the connect-slack-employee edge function
      const { data, error } = await supabase.functions.invoke("connect-slack-employee", {
        body: {
          employee_id: employeeId,
          workspace_id: currentCompany.id
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to connect to Slack");
      }
      
      toast.success("Successfully connected to Slack!");
      
      // Call the onConnectionChange callback if provided
      if (onConnectionChange) {
        onConnectionChange();
      }
      
    } catch (err) {
      console.error("Error connecting to Slack:", err);
      toast.error(err instanceof Error ? err.message : "Failed to connect to Slack");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isConnected ? "secondary" : "default"}
      size="sm"
      onClick={handleConnectToSlack}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          {isConnected ? "Reconnect Slack" : "Connect to Slack"}
        </>
      )}
    </Button>
  );
}
