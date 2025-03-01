
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Edit3, Users, PenTool, Save } from 'lucide-react';
import UploadPDF from './UploadPDF';
import PDFEditor from './PDFEditor';
import PDFViewer from './PDFViewer';
import { toast } from "sonner";

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
    toast.success("File uploaded. Now add signature and text fields.");
  };

  const handleAddFields = (newFields: Array<any>) => {
    setFields([...fields, ...newFields]);
    setStep("assign");
    toast.success("Fields added. Now assign people to the fields.");
  };

  const handleCompleteWorkflow = () => {
    toast.success("Document signing process complete!");
    // Reset workflow
    setTimeout(() => {
      setFile(null);
      setFields([]);
      setStep("upload");
    }, 2000);
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
              <div className="border rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-3">Document Fields ({fields.length})</h4>
                <ul className="space-y-3">
                  {fields.map((field, index) => (
                    <li key={field.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        {field.type === "signature" ? (
                          <PenTool className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <span>{field.type === "signature" ? "Signature" : "Text"} Field {index + 1}</span>
                      </div>
                      <select 
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue=""
                        onChange={() => toast.success(`Assigned field ${index + 1}`)}
                      >
                        <option value="" disabled>Select assignee</option>
                        <option value="user1">John Smith</option>
                        <option value="user2">Jane Doe</option>
                        <option value="user3">David Johnson</option>
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4 bg-background">
                  {file && <PDFViewer file={file} />}
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Your Fields</h4>
                  <ul className="space-y-3">
                    {fields.slice(0, 2).map((field, index) => (
                      <li key={field.id} className="p-3 border rounded bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium flex items-center gap-2">
                            {field.type === "signature" ? (
                              <PenTool className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-500" />
                            )}
                            {field.type === "signature" ? "Signature" : "Text"} Field {index + 1}
                          </span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Assigned to you
                          </span>
                        </div>
                        {field.type === "signature" ? (
                          <div className="border-2 border-dashed rounded p-4 flex items-center justify-center h-20 cursor-pointer hover:bg-muted/50" onClick={() => toast.success("Signature added!")}>
                            <span className="text-sm text-muted-foreground">Click to add your signature</span>
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            className="w-full border rounded px-3 py-2" 
                            placeholder="Enter text here..."
                            onChange={() => toast.success("Text field filled!")}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
              <div className="flex flex-col items-center justify-center border rounded-lg p-8 mb-6 bg-muted/30">
                <Save className="h-12 w-12 text-green-500 mb-3" />
                <h4 className="text-lg font-medium mb-2">Document Successfully Signed!</h4>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                  All parties have completed their assigned fields. The document is now ready for download or storage.
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleCompleteWorkflow}>Download PDF</Button>
                <Button variant="outline" onClick={handleCompleteWorkflow}>Save to Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentSigningWorkflow;
