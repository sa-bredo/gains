
import React, { useState, useEffect } from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/contexts/CompanyContext";
import { Slack, AlertCircle } from "lucide-react";
import { SlackConfig } from './types';
import { SlackSetup } from './components/slack-setup';
import { SlackEmployeeManager } from './components/slack-employee-manager';
import { SlackMessaging } from './components/slack-messaging';
import { SlackTemplates } from './components/slack-templates';

export default function SlackIntegrationPage() {
  const { currentCompany } = useCompany();
  const [slackConfig, setSlackConfig] = useState<SlackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany) {
      fetchSlackConfig();
    }
  }, [currentCompany]);

  const fetchSlackConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentCompany) {
        setError("No company selected");
        return;
      }

      const { data, error } = await supabase
        .from('slack_config')
        .select('*')
        .eq('company_id', currentCompany.id)
        .single();

      if (error) {
        console.error("Error fetching Slack config:", error);
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          setError("Failed to load Slack configuration");
        }
      } else {
        setSlackConfig(data);
      }
    } catch (err) {
      console.error("Exception in fetchSlackConfig:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigUpdate = (config: SlackConfig) => {
    setSlackConfig(config);
  };

  const isConfigured = !!slackConfig?.slack_bot_token;

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Settings / Slack Integration</span>
          </div>
        </header>

        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Slack className="h-8 w-8 text-[#4A154B]" />
              <h1 className="text-3xl font-bold">Slack Integration</h1>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isConfigured ? (
            <SlackSetup 
              loading={loading} 
              onConfigUpdate={handleConfigUpdate} 
            />
          ) : (
            <Tabs defaultValue="status" className="space-y-4">
              <TabsList>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="employees">Employees</TabsTrigger>
                <TabsTrigger value="messaging">Messaging</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Connection Status</CardTitle>
                    <CardDescription>Your Slack workspace connection information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Workspace:</span>
                        <span>{slackConfig?.slack_workspace_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Connected on:</span>
                        <span>{new Date(slackConfig?.connected_at || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">URL:</span>
                        <a href={slackConfig?.slack_team_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {slackConfig?.slack_team_url}
                        </a>
                      </div>

                      <div className="mt-6">
                        <Button variant="destructive" size="sm">
                          Disconnect Workspace
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employees">
                <SlackEmployeeManager slackConfig={slackConfig} />
              </TabsContent>

              <TabsContent value="messaging">
                <SlackMessaging slackConfig={slackConfig} />
              </TabsContent>

              <TabsContent value="templates">
                <SlackTemplates />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SidebarInset>
    </div>
  );
}
