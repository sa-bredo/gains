
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormField } from "../types";
import { useFormService } from "../services/form-service";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DynamicInput } from "./dynamic-input";

interface PublicFormViewProps {
  publicUrl: string;
}

export const PublicFormView: React.FC<PublicFormViewProps> = ({ publicUrl }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const formService = useFormService();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // Fix: Use fetchFormByPublicUrl instead of fetchFormByUrl
        const formData = await formService.fetchFormByPublicUrl(publicUrl);
        setForm(formData);
        
        // Initialize answers
        const initialAnswers: Record<string, any> = {};
        formData.json_config.fields.forEach(field => {
          if (field.type === "checkbox") {
            initialAnswers[field.label] = [];
          } else {
            initialAnswers[field.label] = null;
          }
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching form:", error);
        setError("Form not found. Please check the URL.");
      }
    };

    fetchForm();
  }, [publicUrl, formService]);

  useEffect(() => {
    if (form) {
      const totalFields = form.json_config.fields.length;
      setProgress((currentStep / totalFields) * 100);
    }
  }, [currentStep, form]);

  const handleAnswer = (value: any) => {
    if (!form) return;
    
    const currentField = form.json_config.fields[currentStep];
    setAnswers({
      ...answers,
      [currentField.label]: value
    });
  };

  const goToNextStep = () => {
    if (!form) return;
    
    const totalSteps = form.json_config.fields.length;
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    setIsSubmitting(true);
    
    try {
      // Fix: Use submitForm instead of submitFormResponse
      await formService.submitForm(form.id, answers);
      setIsComplete(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <div className="text-center max-w-md p-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-primary text-primary-foreground rounded-full p-4 inline-flex mx-auto mb-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h2 className="text-3xl font-bold mb-4">Thank you!</h2>
          <p className="text-muted-foreground mb-6">
            Your response has been submitted successfully.
          </p>
          <Button asChild size="lg">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  const currentField = form.json_config.fields[currentStep];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Navigation */}
      <div className="p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentStep + 1} of {form.json_config.fields.length}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Form Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-xl w-full"
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-6">{currentField.label}</h1>
              <DynamicInput
                field={currentField}
                value={answers[currentField.label]}
                onChange={handleAnswer}
                onSubmit={goToNextStep}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Form Branding */}
      <div className="p-4 text-center text-sm text-muted-foreground">
        <p>
          Powered by {form.title} Form Builder
        </p>
      </div>
    </div>
  );
};
