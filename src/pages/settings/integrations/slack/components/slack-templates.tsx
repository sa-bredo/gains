
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Plus, Trash, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SlackTemplates() {
  const [activeTab, setActiveTab] = useState("general");
  
  // This will be replaced with real data later
  const templates = [
    { id: 1, name: "Welcome Message", content: "Welcome to the team, {{name}}! We're excited to have you on board.", category: "welcome" },
    { id: 2, name: "Reminder", content: "Reminder: You have a meeting scheduled for {{time}} today.", category: "reminder" },
    { id: 3, name: "Request Approval", content: "Hi {{manager}}, {{requester}} has requested your approval for {{item}}. Please review at your earliest convenience.", category: "general" },
  ];
  
  const categories = [
    { value: "welcome", label: "Welcome" },
    { value: "reminder", label: "Reminders" },
    { value: "general", label: "General" },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Message Templates</h2>
        <p className="text-muted-foreground">
          Create and manage reusable Slack message templates
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The full message templates functionality will be available soon. This is a preview.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search templates..."
          className="max-w-xs"
        />
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="scheduling" className="flex-1">Scheduling</TabsTrigger>
          <TabsTrigger value="hr" className="flex-1">HR</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">{template.category}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="Copy Template">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete Template">
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {template.content}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-accent/5">
              <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Add new template</p>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduling">
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">No scheduling templates found. Create your first template!</p>
          </div>
        </TabsContent>
        
        <TabsContent value="hr">
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">No HR templates found. Create your first template!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
