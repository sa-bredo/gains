
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SlackCredentialsDialog } from "./SlackCredentialsDialog";

export function SlackIntegrationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { currentCompany } = useCompany();
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [slackCredentialsConfigured, setSlackCredentialsConfigured] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Check if Slack is configured for this workspace
  const checkSlackConfiguration = async () => {
    try {
      setIsLoading(true);
      setLastError(null);
      
      if (!currentCompany?.id) {
        console.log('No company ID available');
        setSlackConnected(false);
        setSlackCredentialsConfigured(false);
        return;
      }
      
      // Check for Slack bot token (indicates active connection)
      const { data: botTokenData, error: botTokenError } = await supabase
        .from("config")
        .select("value")
        .eq("key", "slack_bot_token")
        .eq("company_id", currentCompany.id)
        .maybeSingle();
      
      // Check for Slack credentials configuration
      const { data: credentialsData, error: credentialsError } = await supabase
        .from("config")
        .select("value")
        .eq("key", "slack_client_id")
        .eq("company_id", currentCompany.id)
        .maybeSingle();
      
      // If we get an error that's not related to "no rows", still log it
      if (botTokenError && botTokenError.code !== 'PGRST116') {
        console.error("Error checking Slack configuration:", botTokenError);
      }
      
      if (credentialsError && credentialsError.code !== 'PGRST116') {
        console.error("Error checking Slack credentials:", credentialsError);
      }
      
      // If we have bot token data, Slack is connected
      setSlackConnected(!!botTokenData?.value);
      
      // If we have credentials data, Slack credentials are configured
      setSlackCredentialsConfigured(!!credentialsData?.value);
      setLastChecked(new Date());
      
    } catch (err) {
      console.error("Error checking Slack configuration:", err);
      toast.error("Failed to check Slack configuration status");
      setLastError(err instanceof Error ? err.message : "Unknown error");
      setSlackConnected(false);
      setSlackCredentialsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize Slack OAuth
  const initiateSlackOAuth = async () => {
    try {
      setIsConnecting(true);
      setLastError(null);
      
      if (!currentCompany?.id) {
        toast.error("No workspace selected. Please select a workspace first.");
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("initiate-slack-oauth", {
        body: { company_id: currentCompany?.id }
      });
      
      if (error) {
        console.error("Error from initiateSlackOAuth function:", error);
        throw new Error(error.message);
      }
      
      if (!data?.url) {
        throw new Error("No OAuth URL returned from server");
      }
      
      // Open the OAuth URL in a new window
      const oauthWindow = window.open(data.url, "_blank", "width=800,height=800");
      
      if (!oauthWindow) {
        toast.error("Pop-up was blocked. Please allow pop-ups for this site.");
        return;
      }
      
      toast.info("Please complete the Slack authentication in the new window.");
      
      // Set up a timer to check every 5 seconds if Slack was connected
      let checkAttempts = 0;
      const maxCheckAttempts = 24; // Check for 2 minutes max (24 × 5 seconds)
      
      const checkSlackConnectedInterval = setInterval(async () => {
        checkAttempts++;
        
        // Check if the window was closed
        if (oauthWindow.closed) {
          clearInterval(checkSlackConnectedInterval);
          await checkSlackConfiguration();
          setIsConnecting(false);
        }
        
        // Stop checking after max attempts
        if (checkAttempts >= maxCheckAttempts) {
          clearInterval(checkSlackConnectedInterval);
          setIsConnecting(false);
          toast.info("You can check the connection status by clicking 'Refresh Status'.");
        }
      }, 5000);
      
    } catch (err) {
      console.error("Error initiating Slack OAuth:", err);
      setLastError(err instanceof Error ? err.message : "Unknown error");
      toast.error(err instanceof Error ? err.message : "Failed to connect to Slack");
      setIsConnecting(false);
    }
  };
  
  // Handle successful credentials update
  const handleCredentialsSuccess = () => {
    checkSlackConfiguration();
    toast.success("Slack credentials configured successfully");
  };
  
  // Check Slack configuration when component mounts or company changes
  useEffect(() => {
    if (currentCompany?.id) {
      checkSlackConfiguration();
    }
  }, [currentCompany?.id]);
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>
            Connect your workspace to Slack to enable team collaboration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : slackConnected ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your workspace is connected to Slack. Team members can now connect their individual accounts.
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button 
                  variant="outline" 
                  onClick={checkSlackConfiguration}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Status
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setShowCredentialsDialog(true)}
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              {lastChecked && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : !slackCredentialsConfigured ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To connect to Slack, you first need to configure your Slack application credentials.
              </p>
              <Button onClick={() => setShowCredentialsDialog(true)}>
                Configure Slack Credentials
              </Button>
              {lastError && (
                <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{lastError}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your workspace to Slack to enable features like messaging and notifications.
              </p>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Button 
                  onClick={initiateSlackOAuth}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to Slack"
                  )}
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setShowCredentialsDialog(true)}
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              {isConnecting && (
                <p className="text-xs text-muted-foreground mt-2">
                  Complete the process in the Slack window that opened.
                </p>
              )}
              {lastError && (
                <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p>{lastError}</p>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={checkSlackConfiguration}
                disabled={isLoading}
                size="sm"
                className="mt-4"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <SlackCredentialsDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        onSuccess={handleCredentialsSuccess}
      />
    </>
  );
}
