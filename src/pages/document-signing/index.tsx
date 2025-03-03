
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, ClipboardCheck } from 'lucide-react';
import DocumentSigningWorkflow from './components/DocumentSigningWorkflow';
import TemplatesList from './components/TemplatesList';
import SendContractWorkflow from './components/SendContractWorkflow';
import SentContractsList from './components/SentContractsList';

export default function DocumentSigningPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "create" | "sent" | "send">("sent");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleSendTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveTab("send");
  };

  const handleBackToTemplates = () => {
    setSelectedTemplateId(null);
    setActiveTab("templates");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Document Signing</h1>
      
      {!selectedTemplateId ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "templates" | "create" | "sent" | "send")}>
          <TabsList className="mb-8">
            <TabsTrigger value="sent" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Sent Contracts
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Create New Template
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Document Templates</h2>
              </div>
              <TemplatesList onSendTemplate={handleSendTemplate} />
            </div>
          </TabsContent>
          
          <TabsContent value="create" className="mt-6">
            <DocumentSigningWorkflow />
          </TabsContent>

          <TabsContent value="sent" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Sent Contracts</h2>
              </div>
              <SentContractsList />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <SendContractWorkflow 
          templateId={selectedTemplateId}
          onBack={handleBackToTemplates}
        />
      )}
    </div>
  );
}
