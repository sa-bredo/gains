
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DbDocumentTemplate, convertDbTemplateToTemplate } from '../types';

interface Template {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  fields_count: number;
}

interface TemplatesListProps {
  onSendTemplate: (templateId: string) => void;
}

const TemplatesList = ({ onSendTemplate }: TemplatesListProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('id, name, description, created_at, fields')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedTemplates = data.map((template: DbDocumentTemplate) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        created_at: new Date(template.created_at).toLocaleDateString(),
        fields_count: Array.isArray(template.fields) ? template.fields.length : 0
      }));
      
      setTemplates(formattedTemplates);
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const handleSendClick = (templateId: string) => {
    onSendTemplate(templateId);
  };
  
  const confirmDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateToDelete);
      
      if (error) throw error;
      
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error("Failed to delete template");
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (templates.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/20">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any document templates yet.
        </p>
        <Button variant="outline">Create Your First Template</Button>
      </div>
    );
  }
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Fields</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.description || "—"}</TableCell>
              <TableCell>{template.created_at}</TableCell>
              <TableCell>{template.fields_count}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendTemplate(template.id)}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block">Send</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => confirmDelete(template.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this template? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplatesList;
