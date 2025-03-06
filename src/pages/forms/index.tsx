
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
  
  // Strong reference management to prevent infinite loops
  const isMounted = useRef(true);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    const fetchForms = async () => {
      // Only fetch if we haven't attempted to fetch yet and component is still mounted
      if (fetchAttempted.current || !isMounted.current) return;
      
      // Mark that we've attempted a fetch
      fetchAttempted.current = true;
      console.log("Fetching forms from Supabase - initial load");
      
      try {
        setLoading(true);
        const data = await formService.fetchForms();
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          console.log("Forms fetched successfully:", data);
          setForms(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching forms:", error);
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchForms();
    
    // Clean up function that runs when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, [formService]); // Only re-run if formService changes

  // Separate function to refetch data when needed (e.g., after form deletion)
  const handleFormsChange = async () => {
    if (!isMounted.current) return;
    
    try {
      console.log("Manually refetching forms after change");
      setLoading(true);
      const data = await formService.fetchForms();
      
      if (isMounted.current) {
        setForms(data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error refetching forms:", error);
      if (isMounted.current) {
        setLoading(false);
      }
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
          />
        </div>
      </SidebarInset>
    </div>
  );
};

export default FormsPage;
