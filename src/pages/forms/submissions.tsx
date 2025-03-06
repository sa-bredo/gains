
import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SubmissionsTable } from "./components/submissions-table";
import { useFormService } from "./services/form-service";
import { Form, FormSubmission } from "./types";

const FormSubmissionsPage: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const formService = useFormService();
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const data = await formService.fetchForms();
        setForms(data);
        
        if (data.length > 0 && !selectedFormId) {
          setSelectedFormId(data[0].id);
          setSelectedForm(data[0]);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [formService, selectedFormId]);

  useEffect(() => {
    if (!selectedFormId) return;
    
    const fetchSelectedForm = async () => {
      try {
        const form = await formService.fetchFormById(selectedFormId);
        setSelectedForm(form);
      } catch (error) {
        console.error("Error fetching selected form:", error);
      }
    };

    fetchSelectedForm();
  }, [formService, selectedFormId]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!selectedFormId) return;
      
      setLoading(true);
      try {
        const data = await formService.fetchFormSubmissions(selectedFormId);
        setSubmissions(data);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [formService, selectedFormId]);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Form Submissions</span>
          </div>
        </header>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Form Submissions</h1>
          
          {selectedForm && (
            <SubmissionsTable 
              form={selectedForm}
              submissions={submissions}
              forms={forms}
              loading={loading}
              selectedFormId={selectedFormId || ""}
              onFormSelect={setSelectedFormId}
            />
          )}
        </div>
      </SidebarInset>
    </div>
  );
};

export default FormSubmissionsPage;
