
import React, { useState, useEffect } from "react";
import { Page, PageAction } from "../../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Trash } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface PageActionEditorProps {
  page: Page;
  onUpdate: (updates: Partial<Page>) => void;
}

export const PageActionEditor: React.FC<PageActionEditorProps> = ({
  page,
  onUpdate
}) => {
  const [content, setContent] = useState(page.content || "");
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description || "");
  const [actions, setActions] = useState<PageAction[]>(page.actions || []);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setContent(page.content || "");
    setTitle(page.title);
    setDescription(page.description || "");
    setActions(page.actions || []);
  }, [page]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate({ 
        content,
        title,
        description,
        actions
      });
    } catch (error) {
      console.error('Error saving action page:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAction = () => {
    const newAction: PageAction = {
      id: uuidv4(),
      label: "New Action",
      type: "api",
      config: {}
    };
    setActions([...actions, newAction]);
  };

  const updateAction = (index: number, updates: Partial<PageAction>) => {
    const updatedActions = [...actions];
    updatedActions[index] = { ...updatedActions[index], ...updates };
    setActions(updatedActions);
  };

  const removeAction = (index: number) => {
    const updatedActions = actions.filter((_, i) => i !== index);
    setActions(updatedActions);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="page-title">Page Title</Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="page-description">Description (Optional)</Label>
        <Input
          id="page-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter page description"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="page-content">Content (HTML)</Label>
        <Textarea
          id="page-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter HTML content for this page"
          rows={6}
          className="font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">
          You can use HTML to format your content above the actions.
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Actions</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={addAction}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>
        
        {actions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No actions added yet. Click "Add Action" to create one.
          </p>
        ) : (
          <div className="space-y-4">
            {actions.map((action, index) => (
              <Card key={action.id}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Action {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(index)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`action-label-${index}`}>Button Label</Label>
                    <Input
                      id={`action-label-${index}`}
                      value={action.label}
                      onChange={(e) => updateAction(index, { label: e.target.value })}
                      placeholder="Enter button label"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`action-type-${index}`}>Action Type</Label>
                    <Select
                      value={action.type}
                      onValueChange={(value) => updateAction(index, { type: value as any })}
                    >
                      <SelectTrigger id={`action-type-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api">API Call</SelectItem>
                        <SelectItem value="slack">Slack Integration</SelectItem>
                        <SelectItem value="email">Send Email</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`action-config-${index}`}>Configuration (JSON)</Label>
                    <Textarea
                      id={`action-config-${index}`}
                      value={JSON.stringify(action.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          updateAction(index, { config });
                        } catch (error) {
                          // If JSON is invalid, don't update
                          console.error('Invalid JSON:', error);
                        }
                      }}
                      placeholder="Enter configuration as JSON"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground">
                      Configuration depends on the action type.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Action Page"}
        </Button>
      </div>
    </div>
  );
};
