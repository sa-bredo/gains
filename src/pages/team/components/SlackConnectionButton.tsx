
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";

interface SlackConnectionButtonProps {
  employeeId: string;
  employeeEmail?: string;
  isConnected?: boolean;
  onConnectionChange?: () => void;
}

export function SlackConnectionButton({ 
  employeeId, 
  employeeEmail,
  isConnected = false,
  onConnectionChange
}: SlackConnectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const { currentCompany } = useCompany();

  const handleConnectToSlack = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setErrorDetails(null);
      
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
        let errorMessage = data.error || "Failed to connect to Slack";
        
        // Handle specific error cases
        if (errorMessage.includes("invalid_arguments") || 
            errorMessage.includes("not found in your Slack workspace")) {
          setErrorDetails(employeeEmail ? 
            `The email "${employeeEmail}" could not be found in your Slack workspace. Make sure this employee has been invited to your Slack workspace and is using this email address.` :
            "This employee's email address could not be found in your Slack workspace. Make sure they have been invited to Slack using the same email address as in this system."
          );
          setShowErrorDialog(true);
          return;
        }
        
        throw new Error(errorMessage);
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
    <>
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
      
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Slack Connection Failed
            </DialogTitle>
            <DialogDescription>
              {errorDetails || "Could not connect this employee to Slack."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              To fix this issue:
            </p>
            <ol className="list-decimal ml-5 text-sm space-y-2">
              <li>Make sure the employee has been invited to your Slack workspace</li>
              <li>Verify the employee is using the same email address in both systems</li>
              <li>Check that your Slack app has the necessary permissions</li>
            </ol>
            <div className="flex justify-end">
              <Button onClick={() => setShowErrorDialog(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
