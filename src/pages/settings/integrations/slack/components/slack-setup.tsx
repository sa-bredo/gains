import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SlackConfig } from "../types";
import { SlackIntegrationCard } from "./SlackIntegrationCard";
import { SlackCredentialsDialog } from "./SlackCredentialsDialog";

interface SlackSetupProps {
  slackConfig: SlackConfig | null;
  refetchSlackConfig: () => void;
}

export function SlackSetup({ slackConfig, refetchSlackConfig }: SlackSetupProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Slack Setup</h2>
        <p className="text-muted-foreground">
          Configure your Slack integration to connect with your workspace
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
          <CardDescription>
            Manage your Slack integration and connection status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SlackIntegrationCard slackConfig={slackConfig} refetchSlackConfig={refetchSlackConfig} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
          <CardDescription>
            Update your Slack app credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SlackCredentialsDialog slackConfig={slackConfig} refetchSlackConfig={refetchSlackConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
