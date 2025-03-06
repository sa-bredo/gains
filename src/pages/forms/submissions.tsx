
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { SubmissionsTable } from "./components/submissions-table";
import { useFormService } from "./services/form-service";
import { Form, FormSubmission } from "./types";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const FormSubmissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formService = useFormService();
  const navigate = useNavigate();
  
  // Add these refs to prevent re-fetching and infinite loops
  const isMounted = useRef(true);
  const dataFetched = useRef<string | null>(null);

  const fetchFormAndSubmissions = useCallback(async () => {
    if (!id || dataFetched.current === id || !isMounted.current) {
      console.log("Skipping form/submissions fetch:", { id, fetchedId: dataFetched.current, mounted: isMounted.current });
      return;
    }

    console.log("Attempting to fetch form and submissions with ID:", id);
    dataFetched.current = id;

    setLoading(true);
    try {
      // Fetch the form data
      const formData = await formService.fetchFormById(id);
      
      if (isMounted.current) {
        setForm(formData);
        
        // Fetch submissions for this form
        const submissionsData = await formService.fetchFormSubmissions(id);
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error("Error fetching form or submissions:", error);
      if (isMounted.current) {
        setError("Failed to load form data or submissions.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, formService]);

  useEffect(() => {
    isMounted.current = true;
    dataFetched.current = null;

    if (id) fetchFormAndSubmissions();

    return () => {
      console.log("FormSubmissionsPage unmounting");
      isMounted.current = false;
    };
  }, [id, fetchFormAndSubmissions]);

  const handleBackClick = () => {
    navigate('/forms');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick} 
                className="mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to forms</span>
              </Button>
              <span className="font-medium">Form Submissions</span>
            </div>
          </header>
          <div className="container mx-auto py-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading submission data...</span>
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackClick} 
                className="mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to forms</span>
              </Button>
              <span className="font-medium">Form Submissions</span>
            </div>
          </header>
          <div className="container mx-auto py-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error || "Form not found"}</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/forms')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Return to Forms
                </button>
              </div>
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBackClick} 
              className="mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to forms</span>
            </Button>
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
