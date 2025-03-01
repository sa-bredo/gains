
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Edit3, Save } from 'lucide-react';
import UploadPDF from './UploadPDF';
import PDFEditor, { Field } from './PDFEditor';
import PDFViewer from './PDFViewer';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';

const STEPS = [
  { id: "upload", icon: Upload, label: "Upload PDF" },
  { id: "edit", icon: Edit3, label: "Add Fields" },
  { id: "save", icon: Save, label: "Save Template" }
];

const DocumentSigningWorkflow = () => {
  const [step, setStep] = useState<string>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    // Move to next step after uploading
    setStep("edit");
    toast.success("File uploaded. Now add signature and text fields.");
  };

  const handleAddFields = (newFields: Field[]) => {
    setFields(newFields);
    setStep("save");
    toast.success("Fields added. Now save your template.");
  };
  
  const handleSaveTemplateClick = () => {
    setShowSaveDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsSaving(true);

    try {
      // Convert the PDF file to base64 for storage
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64File = reader.result?.toString().split(',')[1];
          
          // Save to Supabase
          const { data, error } = await supabase
            .from('document_templates')
            .insert([
              { 
                name: templateName,
                description: templateDescription || null,
                pdf_data: base64File,
                fields: fields,
              }
            ])
            .select();
          
          if (error) throw error;
          
          toast.success("Template saved successfully!");
          setShowSaveDialog(false);
          
          // Reset workflow
          setTimeout(() => {
            setFile(null);
            setFields([]);
            setStep("upload");
            setTemplateName("");
            setTemplateDescription("");
          }, 1000);
        } catch (err) {
          console.error("Error saving template:", err);
          toast.error("Failed to save template");
        } finally {
          setIsSaving(false);
        }
      };
      
      if (file) {
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Error in file reading:", err);
      toast.error("Failed to process file");
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          {STEPS.map((s) => (
            <TabsTrigger 
              key={s.id} 
              value={s.id}
              className="flex flex-col items-center gap-2 py-4"
              disabled={!file && s.id !== "upload"}
            >
              <s.icon className="h-5 w-5" />
              <span>{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <UploadPDF onFileUploaded={handleFileUpload} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {file && (
                <PDFEditor 
                  file={file} 
                  onFieldsAdded={handleAddFields}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="save" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Save Document Template</h3>
              <p className="text-muted-foreground mb-6">
                Save your document as a template for future use.
              </p>
              <div className="border rounded-lg p-4 bg-background mb-6">
                {file && <PDFViewer file={file} />}
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTemplateClick}>
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Document Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input 
                id="template-name" 
                placeholder="e.g., Front of House Contract" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Input 
                id="template-description" 
                placeholder="Brief description of this template" 
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentSigningWorkflow;
