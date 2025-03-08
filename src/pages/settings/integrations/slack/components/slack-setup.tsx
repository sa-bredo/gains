
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slack, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { useToast } from "@/hooks/use-toast";
import { SlackConfig } from '../types';

interface SlackSetupProps {
  loading: boolean;
  onConfigUpdate: (config: SlackConfig) => void;
}

export function SlackSetup({ loading, onConfigUpdate }: SlackSetupProps) {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!currentCompany) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No company selected",
      });
      return;
    }

    setIsConnecting(true);

    try {
      // In a real implementation, this would redirect to Slack OAuth
      // For this implementation, we'll simulate the connection process
      const { data, error } = await supabase.functions.invoke('initiate-slack-oauth', {
        body: { company_id: currentCompany.id },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Redirect to Slack OAuth URL
      window.location.href = data.url;
    } catch (err) {
      console.error('Error connecting to Slack:', err);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to connect to Slack",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Slack className="h-6 w-6 text-[#4A154B]" />
          <CardTitle>Connect to Slack</CardTitle>
        </div>
        <CardDescription>
          Connect your Slack workspace to enable messaging with your team members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Before you start</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              You'll need to create a Slack app in the Slack API Console and configure it with the following permissions:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="text-xs bg-muted p-1 rounded">chat:write</code> - To send messages</li>
              <li><code className="text-xs bg-muted p-1 rounded">users:read</code> - To access user information</li>
              <li><code className="text-xs bg-muted p-1 rounded">users:read.email</code> - To match employees by email</li>
              <li><code className="text-xs bg-muted p-1 rounded">im:write</code> - To open direct message channels</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-4">
              Connecting to Slack allows you to send messages to your team members and link their accounts to their employee profiles.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || loading || !currentCompany}
              className="gap-2 bg-[#4A154B] hover:bg-[#611f64]"
            >
              <Slack className="h-4 w-4" />
              {isConnecting ? "Connecting..." : "Connect to Slack"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-muted-foreground">
          By connecting, you allow this application to access your Slack workspace according to their Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
