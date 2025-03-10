
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Page } from '@/pages/page-flows/types';
import { FileTextIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PageDocumentEditorProps {
  page: Page;
  onSave: (pageData: Partial<Page>) => void;
}

interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
}

export function PageDocumentEditor({ page, onSave }: PageDocumentEditorProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(page.document_id || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('document_templates')
          .select('id, name, description');
        
        if (error) {
          console.error('Error fetching document templates:', error);
          return;
        }
        
        setTemplates(data || []);
      } catch (err) {
        console.error('Error in template fetch:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSave = () => {
    if (!selectedTemplateId) return;
    
    const updatedPage: Partial<Page> = {
      document_id: selectedTemplateId
    };
    
    onSave(updatedPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assign Document</h2>
      </div>

      <div className="bg-muted/40 p-6 rounded-lg border">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary/10 p-3 rounded-full">
            <FileTextIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-medium">Document Assignment</h3>
            <p className="text-muted-foreground">
              Choose a document template to include in this flow
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-4 text-center text-muted-foreground">
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground mb-4">No document templates found</p>
            <Button variant="outline">Create Template</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Template</label>
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateId && (
              <div className="pt-4">
                <Button onClick={handleSave} className="w-full">
                  Assign Document Template
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
        <h4 className="text-amber-800 font-medium mb-1">Document Assignment</h4>
        <p className="text-amber-700 text-sm">
          When this page is shown to users, they will be prompted to review and 
          electronically sign the selected document template. The flow will only 
          proceed once the document has been signed.
        </p>
      </div>
    </div>
  );
}
