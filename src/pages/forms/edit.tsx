
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { FormBuilder } from "./components/form-builder";
import { useFormService } from "./services/form-service";
import { Form } from "./types";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PublicFormView } from "./components/public-form-view";

const EditFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Memoize formService to prevent unnecessary re-renders
  const formService = useMemo(() => useFormService(), []);

  // ✅ Use refs to manage component lifecycle & prevent re-fetching loops
  const isMounted = useRef(true);
  const dataFetched = useRef<string | null>(null); // Track last fetched form ID

  // ✅ Ensure fetchForm is stable
  const fetchForm = useCallback(async () => {
    if (!id || dataFetched.current === id || !isMounted.current) {
      console.log("Skipping form fetch:", { id, fetchedId: dataFetched.current, mounted: isMounted.current });
      return;
    }

    console.log("Attempting to fetch form with ID:", id);
    dataFetched.current = id; // Prevent duplicate fetches

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

  // ✅ Ensure useEffect only runs when ID changes and fetchForm remains stable
  useEffect(() => {
    isMounted.current = true;
    dataFetched.current = null; // Reset tracking

    if (id) fetchForm();

    return () => {
      console.log("EditFormPage unmounting");
      isMounted.current = false;
    };
  }, [id, fetchForm]); // Runs only when `id` changes

  const handlePreviewClick = () => {
    setPreviewOpen(true);
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
              <h1 className="text-2xl font-bold">Edit Form</h1>
              <Button variant="outline" size="sm" onClick={handlePreviewClick}>
                <Eye className="mr-2 h-4 w-4" />
                Preview Form
              </Button>
            </div>
            {form && <FormBuilder key={`form-${form.id}`} form={form} />}
          </div>
        </SidebarInset>

        {form && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>Form Preview: {form.title}</DialogTitle>
              </DialogHeader>
              <div className="h-full overflow-auto">
                <PublicFormView publicUrl={form.public_url} isPreview={true} />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
  );
};

export default EditFormPage;
