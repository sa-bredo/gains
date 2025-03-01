
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ClipboardCheck, CheckCircle, Mail } from 'lucide-react';
import PDFViewer from './PDFViewer';
import AssignFieldsForm from './AssignFieldsForm';
import { Field } from './PDFEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Employee } from '../hooks/useEmployees';
import { Json } from '@/integrations/supabase/types';
import { 
  DocumentTemplate, DocumentInstance, DbDocumentTemplate, DbDocumentInstance,
  convertDbTemplateToTemplate, convertDbInstanceToInstance 
} from '../types';

const STEPS = [
  { id: "assign", icon: Users, label: "Assign People" },
  { id: "status", icon: ClipboardCheck, label: "Status" }
];

interface SendContractWorkflowProps {
  templateId: string;
  onBack: () => void;
}

interface SigningStatus {
  field_id: string;
  employee: Employee;
  status: 'pending' | 'signed';
  role: string;
  is_manager: boolean;
}

const SendContractWorkflow = ({ templateId, onBack }: SendContractWorkflowProps) => {
  const [step, setStep] = useState<string>("assign");
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [documentInstance, setDocumentInstance] = useState<DocumentInstance | null>(null);
  const [signingStatuses, setSigningStatuses] = useState<SigningStatus[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('document_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) throw error;
        
        const dbTemplate = data as DbDocumentTemplate;
        const templateData = convertDbTemplateToTemplate(dbTemplate);
        
        setTemplate(templateData);
        setFields(templateData.fields || []);
        
        if (templateData.pdf_data) {
          const binaryString = atob(templateData.pdf_data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes.buffer], { type: 'application/pdf' });
          const pdfFile = new File([blob], `${templateData.name}.pdf`, { type: 'application/pdf' });
          setFile(pdfFile);
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        toast.error("Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplate();
  }, [templateId]);
  
  const handleAssignmentComplete = async (assignedFields: Field[]) => {
    if (!template) return;
    
    try {
      const { data, error } = await supabase
        .from('document_instances')
        .insert({
          template_id: templateId,
          name: template.name || "Untitled Document",
          status: 'draft',
          fields: assignedFields as unknown as Json
        })
        .select();
      
      if (error) throw error;
      
      const instanceData = data[0] as DbDocumentInstance;
      const documentData = convertDbInstanceToInstance(instanceData);
      
      setDocumentInstance(documentData);
      
      const statuses: SigningStatus[] = [];
      
      const employeesByField: Record<string, Employee> = {};
      const uniqueEmployees: Record<string, Employee> = {};
      
      assignedFields.forEach(field => {
        if (field.assignedTo) {
          const employee = {
            id: field.assignedTo,
            first_name: field.assignedToFirstName || "",
            last_name: field.assignedToLastName || "",
            email: field.assignedToEmail || "",
            role: field.assignedToRole || "",
            avatar_url: field.assignedToAvatar || null
          };
          
          employeesByField[field.id] = employee;
          uniqueEmployees[employee.id] = employee;
          
          statuses.push({
            field_id: field.id,
            employee,
            status: 'pending',
            role: employee.role,
            is_manager: employee.role === "Manager" || employee.role === "Admin"
          });
        }
      });
      
      setSigningStatuses(statuses);
      setStep("status");
      toast.success("Document ready for signing");
    } catch (err) {
      console.error("Error creating document instance:", err);
      toast.error("Failed to prepare document for signing");
    }
  };
  
  const handleSendToNonManagers = () => {
    const nonManagerStatuses = signingStatuses.filter(status => !status.is_manager);
    if (nonManagerStatuses.length === 0) {
      toast.info("No non-manager signers to send to");
      return;
    }
    
    updateDocumentStatus('sent');
    
    toast.success(`Sent to ${nonManagerStatuses.length} recipient(s)`);
  };
  
  const handleSimulateNonManagerSigning = async () => {
    const updatedStatuses = [...signingStatuses];
    let foundOne = false;
    
    for (let i = 0; i < updatedStatuses.length; i++) {
      if (!updatedStatuses[i].is_manager && updatedStatuses[i].status === 'pending') {
        updatedStatuses[i].status = 'signed';
        foundOne = true;
        break;
      }
    }
    
    if (!foundOne) {
      toast.info("No pending non-manager signatures to simulate");
      return;
    }
    
    setSigningStatuses(updatedStatuses);
    
    const allNonManagersSigned = updatedStatuses
      .filter(status => !status.is_manager)
      .every(status => status.status === 'signed');
    
    if (allNonManagersSigned) {
      toast.success("All non-managers have signed! Now sending to managers...");
      updateDocumentStatus('signing');
    }
  };
  
  const handleSimulateManagerSigning = async () => {
    const updatedStatuses = [...signingStatuses];
    let foundOne = false;
    
    for (let i = 0; i < updatedStatuses.length; i++) {
      if (updatedStatuses[i].is_manager && updatedStatuses[i].status === 'pending') {
        updatedStatuses[i].status = 'signed';
        foundOne = true;
        break;
      }
    }
    
    if (!foundOne) {
      toast.info("No pending manager signatures to simulate");
      return;
    }
    
    setSigningStatuses(updatedStatuses);
    
    const allSigned = updatedStatuses.every(status => status.status === 'signed');
    
    if (allSigned) {
      toast.success("All parties have signed the document!");
      updateDocumentStatus('completed');
    }
  };
  
  const handleSendFinalDocument = () => {
    toast.success("Signed document sent to all parties!");
  };
  
  const updateDocumentStatus = async (status: 'draft' | 'sent' | 'signing' | 'completed') => {
    if (!documentInstance) return;
    
    try {
      const { error } = await supabase
        .from('document_instances')
        .update({ status })
        .eq('id', documentInstance.id);
      
      if (error) throw error;
      
      setDocumentInstance({
        ...documentInstance,
        status
      });
    } catch (err) {
      console.error("Error updating document status:", err);
      toast.error("Failed to update document status");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-8 border rounded-lg">
        <p className="text-destructive mb-4">Failed to load template</p>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{template?.name}</h2>
        <Button variant="outline" onClick={onBack}>Back to Templates</Button>
      </div>
      
      <Tabs value={step} onValueChange={setStep} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          {STEPS.map((s) => (
            <TabsTrigger 
              key={s.id} 
              value={s.id}
              className="flex flex-col items-center gap-2 py-4"
            >
              <s.icon className="h-5 w-5" />
              <span>{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="assign" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {file && fields && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-background">
                    <PDFViewer file={file} />
                  </div>
                  <div>
                    <AssignFieldsForm 
                      fields={fields}
                      onAssignmentComplete={handleAssignmentComplete}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Document Status</h3>
              
              <div className="space-y-8">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Document Signing Status</h4>
                    {documentInstance && (
                      <Badge variant={
                        documentInstance.status === 'completed' ? "default" : 
                        documentInstance.status === 'signing' ? "outline" : 
                        documentInstance.status === 'sent' ? "secondary" : "destructive"
                      }>
                        {documentInstance.status === 'completed' ? "Completed" : 
                         documentInstance.status === 'signing' ? "Signing In Progress" : 
                         documentInstance.status === 'sent' ? "Sent" : "Draft"}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-5 w-5 ${documentInstance?.status !== 'draft' ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={documentInstance?.status !== 'draft' ? 'text-green-700' : 'text-gray-500'}>
                        Document Prepared
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-5 w-5 ${documentInstance?.status !== 'draft' && documentInstance?.status !== 'sent' ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={documentInstance?.status !== 'draft' && documentInstance?.status !== 'sent' ? 'text-green-700' : 'text-gray-500'}>
                        Non-Manager Signatures Complete
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-5 w-5 ${documentInstance?.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={documentInstance?.status === 'completed' ? 'text-green-700' : 'text-gray-500'}>
                        Manager Signatures Complete
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className={`h-5 w-5 ${false ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={false ? 'text-green-700' : 'text-gray-500'}>
                        Final Document Sent
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Signature Status</h4>
                  
                  <div className="space-y-2">
                    {signingStatuses.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 font-medium text-sm px-2 pb-2 border-b">
                          <div>Signer</div>
                          <div>Role</div>
                          <div>Status</div>
                        </div>
                        
                        {signingStatuses.map((status, index) => (
                          <div key={index} className="grid grid-cols-3 text-sm py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {status.employee.first_name.charAt(0)}{status.employee.last_name.charAt(0)}
                              </span>
                              <div>
                                <div>{status.employee.first_name} {status.employee.last_name}</div>
                                <div className="text-xs text-muted-foreground">{status.employee.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {status.role}
                            </div>
                            <div className="flex items-center">
                              <Badge variant={status.status === 'signed' ? "default" : "outline"}>
                                {status.status === 'signed' ? "Signed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center p-4">
                        No signers assigned yet
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">Actions</h4>
                  
                  <div className="space-y-4">
                    {documentInstance?.status === 'draft' && (
                      <div className="flex flex-col items-start gap-2 p-3 rounded-md bg-muted/20">
                        <div className="font-medium">1. Send to all non-manager signers</div>
                        <p className="text-sm text-muted-foreground">
                          This will send the document to all assigned non-manager signers.
                        </p>
                        <Button 
                          onClick={handleSendToNonManagers}
                          className="mt-2"
                        >
                          Send to Non-Managers
                        </Button>
                      </div>
                    )}
                    
                    {documentInstance?.status === 'sent' && (
                      <div className="flex flex-col items-start gap-2 p-3 rounded-md bg-muted/20">
                        <div className="font-medium">Demo: Simulate Non-Manager Signing</div>
                        <p className="text-sm text-muted-foreground">
                          This button simulates a non-manager signing the document.
                        </p>
                        <Button 
                          variant="outline"
                          onClick={handleSimulateNonManagerSigning}
                          className="mt-2"
                        >
                          Simulate Non-Manager Signing
                        </Button>
                      </div>
                    )}
                    
                    {documentInstance?.status === 'signing' && (
                      <div className="flex flex-col items-start gap-2 p-3 rounded-md bg-muted/20">
                        <div className="font-medium">Demo: Simulate Manager Signing</div>
                        <p className="text-sm text-muted-foreground">
                          This button simulates a manager signing the document.
                        </p>
                        <Button 
                          variant="outline"
                          onClick={handleSimulateManagerSigning}
                          className="mt-2"
                        >
                          Simulate Manager Signing
                        </Button>
                      </div>
                    )}
                    
                    {documentInstance?.status === 'completed' && (
                      <div className="flex flex-col items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200">
                        <div className="font-medium text-green-800">All signatures completed!</div>
                        <p className="text-sm text-green-700">
                          The document has been signed by all parties. You can now send the final signed document.
                        </p>
                        <Button 
                          onClick={handleSendFinalDocument}
                          className="mt-2"
                        >
                          Send Final Document to All Parties
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SendContractWorkflow;
