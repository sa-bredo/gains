import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSlackConfig } from "../services/slack-service";
import { CheckCircle2, CircleX, Loader2 } from "lucide-react";
import { SlackCredentialsDialog } from "./SlackCredentialsDialog";
import { useToast } from "@/hooks/use-toast";

export function SlackSetup() {
  const { slackConfig, isLoading, error, refetchSlackConfig } = useSlackConfig();
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSaveSuccess = () => {
    refetchSlackConfig();
    toast({
      title: "Slack credentials saved",
      description: "Slack integration is now configured.",
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Slack Integration Setup</CardTitle>
        <CardDescription>
          Configure your Slack workspace to connect with our platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <p>Loading Slack configuration...</p>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-red-500">
            <CircleX className="mr-2 h-4 w-4" />
            <p>Error: {error.message}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                {slackConfig?.bot_token ? (
                  <>
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                    <p>Slack integration is active.</p>
                  </>
                ) : (
                  <>
                    <CircleX className="text-red-500 h-5 w-5" />
                    <p>Slack integration is not configured.</p>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your Slack credentials and settings.
              </p>
            </div>
            <Button onClick={() => setCredentialsDialogOpen(true)}>
              {slackConfig?.bot_token ? "Edit Slack Credentials" : "Set Up Slack Credentials"}
            </Button>
            <SlackCredentialsDialog 
              open={credentialsDialogOpen} 
              onOpenChange={setCredentialsDialogOpen} 
              onSuccess={handleSaveSuccess} 
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
