
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { FormBuilder } from "./components/form-builder";
import { useFormService } from "./services/form-service";
import { Form } from "./types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EditFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formService = useFormService();
  const navigate = useNavigate();
  
  // Strong reference management to prevent infinite loops
  const isMounted = useRef(true);
  const dataFetched = useRef(false);
  const formId = useRef(id);

  const fetchForm = useCallback(async () => {
    // Only fetch if we have an ID, haven't completed a fetch yet, and component is still mounted
    if (!formId.current || dataFetched.current || !isMounted.current) {
      console.log("Skipping form fetch:", { id: formId.current, fetched: dataFetched.current, mounted: isMounted.current });
      return;
    }
    
    // Mark that we've started a fetch to prevent repeated attempts
    dataFetched.current = true;
    
    console.log("Attempting to fetch form with ID:", formId.current);
    
    try {
      setLoading(true);
      const data = await formService.fetchFormById(formId.current);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        console.log("Form data received:", data);
        setForm(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setError("Failed to load form. It may have been deleted or you don't have permission to view it.");
        toast.error("Could not load the form. Please try again later.");
        setLoading(false);
      }
    }
  }, [formService]);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    dataFetched.current = false;
    formId.current = id;
    
    fetchForm();
    
    // Clean up function that runs when component unmounts
    return () => {
      console.log("EditFormPage unmounting");
      isMounted.current = false;
    };
  }, [id, fetchForm]); // Only re-run if fetchForm or id changes

  if (loading) {
    return (
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Edit Form</span>
            </div>
          </header>
          <div className="container mx-auto py-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading form data...</span>
          </div>
        </SidebarInset>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Edit Form</span>
            </div>
          </header>
          <div className="container mx-auto py-6">
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p>{error}</p>
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

  // Only render FormBuilder once the form data is loaded
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Edit Form</span>
          </div>
        </header>
        <div className="container mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Edit Form</h1>
          {form && <FormBuilder key={`form-${form.id}`} form={form} />}
        </div>
      </SidebarInset>
    </div>
  );
};

export default EditFormPage;
