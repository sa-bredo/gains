
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageTemplate, messageCategories } from "../types";
import { Edit, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface MessageTemplateCardProps {
  template: MessageTemplate;
  onEdit: () => void;
  onDelete: () => void;
}

export function MessageTemplateCard({ template, onEdit, onDelete }: MessageTemplateCardProps) {
  const category = messageCategories.find(c => c.value === template.category);
  const formattedDate = template.created_at ? new Date(template.created_at).toLocaleDateString() : "Unknown date";
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(template.content);
    toast.success("Template content copied to clipboard");
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="mb-1">{template.name}</CardTitle>
            <CardDescription>{category?.label || template.category}</CardDescription>
          </div>
          <Badge variant={template.type === 'slack' ? 'default' : template.type === 'email' ? 'secondary' : 'outline'}>
            {template.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="bg-muted p-3 rounded-md text-sm mb-4 overflow-auto max-h-[120px]">
          {template.content}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">Created: {formattedDate}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
