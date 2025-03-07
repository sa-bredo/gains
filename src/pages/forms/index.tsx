
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormsTable } from "./components/forms-table";
import { useFormService } from "./services/form-service";
import { Form } from "./types";
import { toast } from "sonner";

const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Ensure formService is stable to avoid unnecessary re-renders
  const formService = useMemo(() => useFormService(), []);

  // Use refs to track component state and prevent loops
  const isMounted = useRef(true);
  const dataFetched = useRef(false);

  // ✅ Memoize fetchForms to avoid unnecessary recreation
  const fetchForms = useCallback(async () => {
    if (dataFetched.current || !isMounted.current) return;

    try {
      console.log("Fetching forms from Supabase - initial load");
      setLoading(true);
      dataFetched.current = true; // Prevent duplicate calls

      const data = await formService.fetchForms();

      if (isMounted.current) {
        console.log("Forms fetched successfully:", data);
        setForms(data);
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [formService]);

  // ✅ Ensure fetchForms runs only once by making useEffect stable
  useEffect(() => {
    isMounted.current = true;
    dataFetched.current = false;

    fetchForms();

    return () => {
      isMounted.current = false;
    };
  }, [fetchForms]);

  // Separate function to manually trigger refetch
  const handleFormsChange = async () => {
    if (!isMounted.current) return;

    try {
      console.log("Manually refetching forms after change");
      setLoading(true);

      formService.clearFormsCache();
      dataFetched.current = false;

      const data = await formService.fetchForms();

      if (isMounted.current) {
        setForms(data);
      }
    } catch (error) {
      console.error("Error refetching forms:", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  // Handle form archiving
  const handleArchiveForm = async (id: string) => {
    try {
      setLoading(true);
      await formService.archiveForm(id);
      toast.success("Form archived successfully");
      
      // Remove the archived form from the state
      setForms(prevForms => prevForms.filter(form => form.id !== id));
    } catch (error) {
      console.error("Error archiving form:", error);
      toast.error("Failed to archive form");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Forms</span>
            </div>
          </header>
          <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Forms</h1>
              <Button onClick={() => navigate("/forms/new")}>
                <Plus className="mr-2 h-4 w-4" /> Create New Form
              </Button>
            </div>

            <FormsTable
                forms={forms}
                loading={loading}
                onFormsChange={handleFormsChange}
                onArchive={handleArchiveForm}
            />
          </div>
        </SidebarInset>
      </div>
  );
};

export default FormsPage;
