
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FormsTable } from "./components/forms-table";
import { Form } from "./types";
import { useFormService } from "./services/form-service";
import { useToast } from "@/hooks/use-toast";

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const formService = useFormService();
  const { toast } = useToast();

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const formsData = await formService.fetchForms();
      setForms(formsData);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast({
        title: "Error",
        description: "Failed to load forms",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Forms</h1>
        <Button asChild>
          <Link to="/forms/new">
            <Plus className="mr-2 h-4 w-4" />
            New Form
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <FormsTable forms={forms} onFormsChange={fetchForms} />
      )}
    </div>
  );
}
