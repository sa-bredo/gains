
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Pencil, Save } from 'lucide-react';
import UploadPDF from './UploadPDF';
import PDFEditor, { Field } from './PDFEditor';
import PDFViewer from './PDFViewer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Json } from '@/integrations/supabase/types';

const STEPS = [
  { id: "upload", icon: FileUp, label: "Upload PDF" },
  { id: "edit", icon: Pencil, label: "Add Fields" },
  { id: "save", icon: Save, label: "Save Template" }
];

const DocumentSigningWorkflow = () => {
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleFileUploaded = (uploadedFile: File) => {
    setFile(uploadedFile);
    setStep("edit");
  };
  
  const handleAddField = (field: Field) => {
    setFields([...fields, field]);
  };
  
  const handleUpdateField = (updatedField: Field) => {
    setFields(fields.map(field => field.id === updatedField.id ? updatedField : field));
  };
  
  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
  };
  
  const handleSaveTemplate = async () => {
    if (!file || !templateName) {
      toast.error("Please provide a template name");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        const pdfData = base64String.split(',')[1];
        
        const { error } = await supabase
          .from('document_templates')
          .insert({
            name: templateName,
            description: templateDescription || null,
            pdf_data: pdfData,
            fields: fields as unknown as Json
          });
        
        if (error) throw error;
        
        toast.success("Template saved successfully!");
        
        setTemplateName("");
        setTemplateDescription("");
        setFields([]);
        setFile(null);
        setStep("upload");
      };
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleContinueToSave = () => {
    if (fields.length === 0) {
      toast.error("Please add at least one signature or text field");
      return;
    }
    
    setStep("save");
    toast.success(`${fields.length} fields added to document`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Document Template Creator</h2>
        <p className="text-muted-foreground">
          Create reusable document templates for your organization.
        </p>
      </div>
      
      <div className="w-full">
        <Tabs value={step} onValueChange={setStep} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            {STEPS.map((s) => (
              <TabsTrigger 
                key={s.id} 
                value={s.id}
                disabled={(s.id === "edit" && !file) || (s.id === "save" && (!file || fields.length === 0))}
                className="flex items-center gap-2 py-3"
              >
                <s.icon className="h-4 w-4" />
                <span>{s.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="upload" className="m-0 mt-2">
              <Card>
                <CardContent className="pt-6">
                  <UploadPDF onFileUploaded={handleFileUploaded} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="edit" className="m-0 mt-2">
              <Card>
                <CardContent className="pt-6">
                  {file && (
                    <PDFEditor 
                      file={file}
                      initialFields={fields}
                      onFieldsAdded={handleAddField}
                      onUpdateField={handleUpdateField}
                      onDeleteField={handleDeleteField}
                      onContinue={handleContinueToSave}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="save" className="m-0 mt-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-1">Template Details</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Provide a name and description for your document template.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label htmlFor="template-name" className="text-sm font-medium">
                          Template Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="template-name"
                          placeholder="e.g., Employee Contract"
                          value={templateName}
                          onChange={(e) => setTemplateName(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="template-description" className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          id="template-description"
                          placeholder="Optional description for this template"
                          value={templateDescription}
                          onChange={(e) => setTemplateDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 mt-8">
                      <div className="bg-muted/20 p-4 rounded-lg flex-1">
                        <h4 className="font-medium mb-2">Template Summary</h4>
                        <div className="text-sm space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">File name:</span>
                            <span className="font-medium">{file?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fields added:</span>
                            <span className="font-medium">{fields.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {file && (
                      <div className="border rounded-lg overflow-hidden bg-white mt-4">
                        <div className="p-4">
                          <h4 className="font-medium mb-2">Document Preview</h4>
                          <div className="border rounded p-2 bg-white" style={{ maxHeight: "300px", overflow: "auto" }}>
                            <PDFViewer file={file} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full mt-6" 
                      onClick={handleSaveTemplate}
                      disabled={isSaving || !templateName || !file}
                    >
                      {isSaving ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentSigningWorkflow;
