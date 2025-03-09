import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMessageTemplates } from "../services/message-template-service";
import { MessageTemplate } from "../types";
import { Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddTemplateDialog from "./AddTemplateDialog";

export function SlackTemplates() {
  const { templates, isLoading, error } = useMessageTemplates();
  const navigate = useNavigate();

  const handleManageTemplates = () => {
    navigate("/settings/integrations/slack/message-templates");
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Create and manage reusable message templates for Slack</CardDescription>
        </div>
        <div className="flex gap-2">
          <AddTemplateDialog />
          <Button variant="outline" onClick={handleManageTemplates}>
            Manage All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>Error loading templates</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No message templates found</p>
            <Button onClick={() => document.querySelector<HTMLButtonElement>('button:has(.plus-icon)')?.click()}>
              <Plus className="h-4 w-4 mr-2 plus-icon" />
              Create Template
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.slice(0, 4).map((template: MessageTemplate) => (
                <div key={template.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.category}</p>
                    </div>
                    <div className="text-xs bg-muted px-2 py-1 rounded-full">
                      {template.type}
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2">{template.content}</p>
                </div>
              ))}
            </div>
            
            {templates.length > 4 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleManageTemplates}>
                  View All Templates
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
