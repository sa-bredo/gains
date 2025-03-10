
import React, { useState, useEffect } from "react";
import { Page } from "../../types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

interface PageContentEditorProps {
  page: Page;
  onUpdate: (content: string) => void;
}

export const PageContentEditor: React.FC<PageContentEditorProps> = ({
  page,
  onUpdate
}) => {
  const [content, setContent] = useState(page.content || "");
  const [title, setTitle] = useState(page.title);
  const [description, setDescription] = useState(page.description || "");
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    setContent(page.content || "");
    setTitle(page.title);
    setDescription(page.description || "");
  }, [page]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(content);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="page-title">Page Title</Label>
        <Input
          id="page-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onUpdate(content)}
          placeholder="Enter page title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="page-description">Description (Optional)</Label>
        <Input
          id="page-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => onUpdate(content)}
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
          rows={10}
          className="font-mono text-sm"
        />
        <p className="text-sm text-muted-foreground">
          You can use HTML to format your content.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Content"}
        </Button>
      </div>
      
      <div>
        <Label>Preview:</Label>
        <div 
          className="p-4 border rounded-md mt-2 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};
