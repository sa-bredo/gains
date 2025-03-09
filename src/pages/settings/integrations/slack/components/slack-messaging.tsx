
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { tabs } from "../index";
import { SlackConfig } from "../types";

export function SlackMessaging() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Slack Messaging</h2>
        <p className="text-muted-foreground">
          Configure how and when messages are sent to your team via Slack
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Message Templates
          </CardTitle>
          <CardDescription>
            Create and manage reusable templates for common Slack messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Standardize your communications with pre-defined templates for announcements, 
            welcome messages, reminders, and more.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline">
            <Link to="/settings/integrations/slack/message-templates">
              Manage Templates
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Messaging configuration will be available soon</CardTitle>
          <CardDescription>
            We're working on additional messaging features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature is coming soon. You'll be able to configure:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Automated notifications</li>
            <li>Message scheduling</li>
            <li>Targeted communications</li>
            <li>Response tracking</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
