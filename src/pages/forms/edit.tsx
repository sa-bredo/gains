
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "./components/form-builder";
import { Form } from "./types";
import { useFormService } from "./services/form-service";
import { useToast } from "@/hooks/use-toast";

export default function EditFormPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const formService = useFormService();
  const { toast } = useToast();

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        const formData = await formService.fetchFormById(id);
        setForm(formData);
      } catch (error) {
        console.error("Error fetching form:", error);
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        });
        navigate("/forms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id, navigate, formService, toast]);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/forms")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {form ? `Edit Form: ${form.title}` : "Create New Form"}
        </h1>
      </div>
      
      <FormBuilder initialForm={form || undefined} />
    </div>
  );
}
