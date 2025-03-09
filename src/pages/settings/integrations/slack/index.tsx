
import React from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SlackIntegrationCard } from "./components/SlackIntegrationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SlackSettingsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Settings / Integrations / Slack</span>
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Slack Integration</h1>
            <p className="text-muted-foreground mt-2">
              Configure and manage your workspace's integration with Slack
            </p>
          </div>
          
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="employee-connections">Employee Connections</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="templates">Message Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="configuration" className="space-y-4">
              <SlackIntegrationCard />
            </TabsContent>
            
            <TabsContent value="employee-connections">
              {/* This will be implemented in the future */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Employee connection management will be available soon.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="messaging">
              {/* This will be implemented in the future */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Messaging configuration will be available soon.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Message Templates</h2>
                  <p className="text-muted-foreground">Create and manage reusable message templates for Slack communications</p>
                </div>
                <Button onClick={() => navigate("/settings/integrations/slack/message-templates")}>
                  Manage Templates
                </Button>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <p>Create reusable message templates for common communications like welcome messages, announcements, reminders, and more.</p>
                <ul className="list-disc ml-6 mt-2 text-muted-foreground">
                  <li>Organize templates by category</li>
                  <li>Use placeholders for dynamic content</li>
                  <li>Save time with ready-to-use templates</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </div>
  );
}
