import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SlackConfig } from "../types";

export function SlackMessaging() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Slack Messaging</h2>
        <p className="text-muted-foreground">
          Configure how and when messages are sent to Slack
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Messaging configuration will be available soon.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>
                Create and manage reusable message templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-8">
                <p className="text-muted-foreground">
                  Message templates will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Set up rules for when messages should be sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-8">
                <p className="text-muted-foreground">
                  Automation rules will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
              <CardDescription>
                View history of messages sent through Slack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-8">
                <p className="text-muted-foreground">
                  Message history will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
