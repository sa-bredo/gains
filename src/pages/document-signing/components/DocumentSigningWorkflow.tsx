
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Pencil, FileUp, Save } from 'lucide-react';
import UploadPDF from './UploadPDF';
import PDFEditor, { Field } from './PDFEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result as string;
        const pdfData = base64String.split(',')[1]; // Remove the data:application/pdf;base64, part
        
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
        
        // Reset form
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
  
  const renderUploadStep = () => (
    <Card>
      <CardContent className="pt-6">
        <UploadPDF onFileUploaded={handleFileUploaded} />
      </CardContent>
    </Card>
  );
  
  const renderEditStep = () => (
    <Card>
      <CardContent className="pt-6">
        {file && (
          <PDFEditor 
            pdfFile={file}
            initialFields={fields}
            onAddField={handleAddField}
            onUpdateField={handleUpdateField}
            onDeleteField={handleDeleteField}
          />
        )}
      </CardContent>
    </Card>
  );
  
  const renderSaveStep = () => (
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
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Document Template Creator</h2>
        <p className="text-muted-foreground">
          Create reusable document templates for your organization.
        </p>
      </div>
      
      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          {STEPS.map((s) => (
            <TabsTrigger 
              key={s.id} 
              value={s.id}
              disabled={s.id === "edit" && !file || s.id === "save" && !file}
              className="flex flex-col items-center gap-2 py-4"
            >
              <s.icon className="h-5 w-5" />
              <span>{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          {renderUploadStep()}
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          {renderEditStep()}
        </TabsContent>
        
        <TabsContent value="save" className="mt-6">
          {renderSaveStep()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentSigningWorkflow;
