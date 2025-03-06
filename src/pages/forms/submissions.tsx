
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SubmissionsTable } from "./components/submissions-table";
import { useFormService } from "./services/form-service";
import { Form, FormSubmission } from "./types";
import { Loader2 } from "lucide-react";

const FormSubmissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formService = useFormService();

  useEffect(() => {
    const fetchFormAndSubmissions = async () => {
      if (!id) {
        setError("Form ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch the form data
        const formData = await formService.fetchFormById(id);
        setForm(formData);
        
        // Fetch submissions for this form
        const submissionsData = await formService.fetchFormSubmissions(id);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching form or submissions:", error);
        setError("Failed to load form data or submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormAndSubmissions();
  }, [id, formService]);

  if (loading) {
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
          <div className="container mx-auto py-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </SidebarInset>
      </div>
    );
  }

  if (error || !form) {
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
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error || "Form not found"}</p>
            </div>
          </div>
        </SidebarInset>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold mb-6">Form Submissions: {form.title}</h1>
          
          <SubmissionsTable 
            form={form}
            submissions={submissions}
            loading={loading}
          />
        </div>
      </SidebarInset>
    </div>
  );
};

export default FormSubmissionsPage;
