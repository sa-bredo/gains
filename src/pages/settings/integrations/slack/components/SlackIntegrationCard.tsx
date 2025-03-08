
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { SlackCredentialsDialog } from "./SlackCredentialsDialog";

export function SlackIntegrationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const { currentCompany } = useCompany();
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  const [slackCredentialsConfigured, setSlackCredentialsConfigured] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  
  // Check if Slack is configured for this workspace
  const checkSlackConfiguration = async () => {
    try {
      setIsLoading(true);
      
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
      
    } catch (err) {
      console.error("Error checking Slack configuration:", err);
      setSlackConnected(false);
      setSlackCredentialsConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize Slack OAuth
  const initiateSlackOAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke("initiate-slack-oauth", {
        body: { company_id: currentCompany?.id }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.url) {
        // Open the OAuth URL in a new window
        window.open(data.url, "_blank", "width=800,height=800");
        toast.info("Please complete the Slack authentication in the new window.");
      } else {
        throw new Error("Failed to get Slack authentication URL");
      }
      
    } catch (err) {
      console.error("Error initiating Slack OAuth:", err);
      toast.error(err instanceof Error ? err.message : "Failed to connect to Slack");
    } finally {
      setIsLoading(false);
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
              <div className="flex space-x-2">
                <Button variant="outline" onClick={checkSlackConfiguration}>
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
            </div>
          ) : !slackCredentialsConfigured ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To connect to Slack, you first need to configure your Slack application credentials.
              </p>
              <Button onClick={() => setShowCredentialsDialog(true)}>
                Configure Slack Credentials
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your workspace to Slack to enable features like messaging and notifications.
              </p>
              <div className="flex space-x-2">
                <Button onClick={initiateSlackOAuth}>
                  Connect to Slack
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setShowCredentialsDialog(true)}
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
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
