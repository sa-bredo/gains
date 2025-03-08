
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/CompanyContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SlackIntegrationCardProps {
  isAdmin?: boolean;
}

export function SlackIntegrationCard({ isAdmin = false }: SlackIntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentCompany } = useCompany();
  const [slackConnected, setSlackConnected] = useState<boolean | null>(null);
  
  // Check if Slack is configured for this workspace
  const checkSlackConfiguration = async () => {
    try {
      setIsLoading(true);
      
      if (!currentCompany?.id) {
        console.log('No company ID available');
        setSlackConnected(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("config")
        .select("value")
        .eq("key", "slack_bot_token")
        .eq("company_id", currentCompany.id)
        .maybeSingle(); // Using maybeSingle instead of single to handle cases when no rows are found
      
      // If we get an error that's not related to "no rows", still log it
      if (error && error.code !== 'PGRST116') {
        console.error("Error checking Slack configuration:", error);
        setSlackConnected(false);
        return;
      }
      
      // If we have data and it has a value, Slack is connected
      setSlackConnected(!!data?.value);
    } catch (err) {
      console.error("Error checking Slack configuration:", err);
      setSlackConnected(false);
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
  
  // Check Slack configuration when component mounts or company changes
  useEffect(() => {
    if (currentCompany?.id) {
      checkSlackConfiguration();
    }
  }, [currentCompany?.id]);
  
  if (!isAdmin) {
    return null;
  }
  
  return (
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
            <Button variant="outline" onClick={checkSlackConfiguration}>
              Refresh Status
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your workspace to Slack to enable features like messaging and notifications.
            </p>
            <Button onClick={initiateSlackOAuth}>
              Connect to Slack
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
