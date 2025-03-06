
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionsTable } from "./components/submissions-table";
import { Form, FormSubmission } from "./types";
import { useFormService } from "./services/form-service";
import { useToast } from "@/hooks/use-toast";

export default function FormSubmissionsPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const formService = useFormService();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch form details
        const formData = await formService.fetchFormById(id);
        setForm(formData);
        
        // Fetch submissions
        const submissionsData = await formService.fetchFormSubmissions(id);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load form submissions",
          variant: "destructive",
        });
        navigate("/forms");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  if (!form) {
    return (
      <div className="container py-6">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Form not found</p>
          <Button asChild className="mt-4">
            <a href="/forms">Back to Forms</a>
          </Button>
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
        <h1 className="text-3xl font-bold">Form Submissions: {form.title}</h1>
      </div>
      
      <SubmissionsTable form={form} submissions={submissions} />
    </div>
  );
}
