
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
  DialogTitle,
  DialogErrorDetails 
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
      
      console.log("Connecting employee to Slack:", {
        employee_id: employeeId,
        workspace_id: currentCompany.id,
        employee_email: employeeEmail
      });
      
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
      
      console.log("Edge function response:", data, error);
      
      if (error) {
        console.error("Edge function error:", error);
        setErrorDetails(error.message);
        setShowErrorDialog(true);
        return;
      }
      
      if (!data.success) {
        let errorMessage = data.error || "Failed to connect to Slack";
        console.error("Connection failure:", errorMessage);
        
        // Display the raw API error in the dialog
        setErrorDetails(errorMessage);
        setShowErrorDialog(true);
        return;
      }
      
      toast.success("Successfully connected to Slack!");
      
      // Call the onConnectionChange callback if provided
      if (onConnectionChange) {
        onConnectionChange();
      }
      
    } catch (err) {
      console.error("Error connecting to Slack:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to Slack";
      setErrorDetails(errorMessage);
      setShowErrorDialog(true);
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
              We couldn't connect this employee to Slack. See details below:
            </DialogDescription>
          </DialogHeader>
          
          {errorDetails && (
            <DialogErrorDetails errorDetails={errorDetails} />
          )}
          
          <div className="space-y-4">
            <p className="text-sm">
              Common causes for this error:
            </p>
            <ol className="list-decimal ml-5 text-sm space-y-2">
              <li>The employee's email address ({employeeEmail}) doesn't match their Slack account email</li>
              <li>The employee hasn't been invited to your Slack workspace yet</li>
              <li>The Slack app needs additional permissions</li>
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
