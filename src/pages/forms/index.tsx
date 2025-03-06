
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormsTable } from "./components/forms-table";
import { useFormService } from "./services/form-service";
import { Form } from "./types";

const FormsPage: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const formService = useFormService();
  const hasFetched = useRef(false);

  const fetchForms = async () => {
    // Prevent multiple fetches in development mode with React.StrictMode
    if (hasFetched.current) return;
    
    try {
      console.log("Fetching forms from Supabase");
      setLoading(true);
      hasFetched.current = true;
      
      const data = await formService.fetchForms();
      console.log("Forms fetched successfully:", data);
      setForms(data);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
    
    // Clean up function to reset the ref when component unmounts
    return () => {
      hasFetched.current = false;
    };
  }, []);

  // Create a safe version of fetchForms for the FormsTable that won't cause infinite loops
  const handleFormsChange = () => {
    hasFetched.current = false;
    fetchForms();
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
          />
        </div>
      </SidebarInset>
    </div>
  );
};

export default FormsPage;
