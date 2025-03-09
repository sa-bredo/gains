
// Import the necessary components and types
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { tabs } from "../index";
import { Link } from "react-router-dom";
import { messageCategories } from "../types";

export function SlackTemplates() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Message Templates</h2>
          <p className="text-muted-foreground">
            Create and manage templates for Slack communications
          </p>
        </div>
        <Button asChild>
          <Link to="/settings/integrations/slack/message-templates">
            Manage Templates
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messageCategories.slice(0, 3).map((category) => (
          <Card key={category.value}>
            <CardHeader>
              <CardTitle>{category.label}</CardTitle>
              <CardDescription>
                Templates for {category.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link to={`/settings/integrations/slack/message-templates?category=${category.value}`}>
                  View Templates
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Recent Templates</h3>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground py-6">
              Go to the Templates page to view and manage all your message templates
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/settings/integrations/slack/message-templates">
                View All Templates
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
