
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Send, ClipboardCheck } from 'lucide-react';
import DocumentSigningWorkflow from './components/DocumentSigningWorkflow';
import TemplatesList from './components/TemplatesList';
import SendContractWorkflow from './components/SendContractWorkflow';
import SentContractsList from './components/SentContractsList';

export default function DocumentSigningPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "create" | "sent" | "send">("templates");
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Document Signing</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Document Signing</h1>
            
            {!selectedTemplateId ? (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "templates" | "create" | "sent" | "send")}>
                <TabsList className="mb-8">
                  <TabsTrigger value="templates" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Create New Template
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Sent Contracts
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
