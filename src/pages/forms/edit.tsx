
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { FormBuilder } from "./components/form-builder";
import { useFormService } from "./services/form-service";
import { Form } from "./types";
import { Loader2, Eye, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const EditFormPage: React.FC = () => {
  // Updated: Use useLocation and URLSearchParams to get id from query parameter
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const formService = useMemo(() => useFormService(), []);

  const isMounted = useRef(true);
  const dataFetched = useRef<string | null>(null);

  const fetchForm = useCallback(async () => {
    if (!id || dataFetched.current === id || !isMounted.current) {
      console.log("Skipping form fetch:", { id, fetchedId: dataFetched.current, mounted: isMounted.current });
      return;
    }

    console.log("Attempting to fetch form with ID:", id);
    dataFetched.current = id;

    try {
      setLoading(true);
      const data = await formService.fetchFormById(id);

      if (isMounted.current) {
        console.log("Form data received:", data);
        setForm(data);
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      if (isMounted.current) {
        setError("Failed to load form. It may have been deleted or you don't have permission to view it.");
        toast.error("Could not load the form. Please try again later.");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [formService, id]);

  useEffect(() => {
    isMounted.current = true;
    dataFetched.current = null;

    if (id) fetchForm();

    return () => {
      console.log("EditFormPage unmounting");
      isMounted.current = false;
    };
  }, [id, fetchForm]);

  const handlePreviewClick = () => {
    if (form?.public_url) {
      window.open(`/form/${form.public_url}`, '_blank');
    }
  };

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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBackClick} 
                  className="mr-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back to forms</span>
                </Button>
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleBackClick}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Edit Form</h1>
              </div>
              <Button variant="outline" size="sm" onClick={handlePreviewClick}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Form
              </Button>
            </div>
            {form && <FormBuilder key={`form-${form.id}`} form={form} />}
          </div>
        </SidebarInset>
      </div>
  );
};

export default EditFormPage;
