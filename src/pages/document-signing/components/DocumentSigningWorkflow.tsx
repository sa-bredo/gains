
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Edit3, Users, PenTool, Save } from 'lucide-react';
import UploadPDF from './UploadPDF';
import PDFEditor from './PDFEditor';

const STEPS = [
  { id: "upload", icon: Upload, label: "Upload PDF" },
  { id: "edit", icon: Edit3, label: "Add Fields" },
  { id: "assign", icon: Users, label: "Assign People" },
  { id: "sign", icon: PenTool, label: "Sign Document" },
  { id: "save", icon: Save, label: "Save & Export" }
];

const DocumentSigningWorkflow = () => {
  const [step, setStep] = useState<string>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<Array<any>>([]);
  
  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    // Move to next step after uploading
    setStep("edit");
  };

  const handleAddFields = (newFields: Array<any>) => {
    setFields([...fields, ...newFields]);
    setStep("assign");
  };

  return (
    <div className="space-y-6">
      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
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

        <TabsContent value="assign" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Assign People to Fields</h3>
              <p className="text-muted-foreground mb-6">
                Select which team members need to fill in each field.
              </p>
              {/* Field assignment UI will go here */}
              <Button onClick={() => setStep("sign")}>Continue to Signing</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sign" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Sign Document</h3>
              <p className="text-muted-foreground mb-6">
                Fill in your assigned fields.
              </p>
              {/* Signing UI will go here */}
              <Button onClick={() => setStep("save")}>Complete Signing</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="save" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Save & Export</h3>
              <p className="text-muted-foreground mb-6">
                Your document has been signed! Download it or save it to your account.
              </p>
              <div className="flex gap-4">
                <Button>Download PDF</Button>
                <Button variant="outline">Save to Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentSigningWorkflow;
