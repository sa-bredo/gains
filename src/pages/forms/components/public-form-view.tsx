
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormField } from "../types";
import { useFormService } from "../services/form-service";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronRight, MessageCircleQuestion } from "lucide-react";
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
  
  const formFetched = useRef(false);
  const isMounted = useRef(true);

  const { toast } = useToast();
  const formService = useFormService();

  useEffect(() => {
    isMounted.current = true;
    
    const fetchForm = async () => {
      if (formFetched.current || !isMounted.current) return;
      
      try {
        console.log(`Fetching form with public URL: ${publicUrl}`);
        formFetched.current = true;
        
        const formData = await formService.fetchFormByPublicUrl(publicUrl);
        
        if (!isMounted.current) return;
        
        console.log(`Form fetched successfully:`, formData);
        setForm(formData);
        
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
        if (isMounted.current) {
          setError("Form not found. Please check the URL.");
        }
      }
    };

    fetchForm();
    
    return () => {
      console.log("PublicFormView unmounting");
      isMounted.current = false;
    };
  }, [publicUrl, formService]);

  useEffect(() => {
    if (form && form.json_config.fields.length > 0) {
      const totalFields = form.json_config.fields.length;
      setProgress((currentStep / totalFields) * 100);
    }
  }, [currentStep, form]);

  const handleAnswer = (value: any) => {
    if (!form) return;
    
    const currentField = form.json_config.fields[currentStep];
    setAnswers(prev => ({
      ...prev,
      [currentField.label]: value
    }));
  };

  const goToNextStep = () => {
    if (!form) return;
    
    const totalSteps = form.json_config.fields.length;
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    setIsSubmitting(true);
    
    try {
      console.log(`Submitting form responses for form ID: ${form.id}`);
      await formService.submitForm(form.id, answers);
      console.log("Form submitted successfully");
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
          <Button asChild size="lg" className="rounded-full">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </motion.div>
    );
  }

  const currentField = form.json_config.fields[currentStep];
  const hasFieldsToShow = form.json_config.fields.length > 0;
  const hasCoverImage = !!form.json_config.coverImage;
  const formTitle = form.title;
  const formDescription = form.description || "";

  return (
    <div className="min-h-screen w-full">
      {/* Main Content - Two Column Layout */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left Column - Image with Form Title */}
        <div className="md:w-1/2 relative overflow-hidden">
          <div className="min-h-[600px] max-h-[700px]">
            <img
              src={form.json_config.coverImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
              alt={formTitle}
              className="w-full max-h-[650px] object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute bottom-16 left-12 text-white">
              <h1 className="text-5xl font-bold leading-tight">
                {formTitle.split(' ').slice(0, Math.ceil(formTitle.split(' ').length / 2)).join(' ')}<br />
                {formTitle.split(' ').slice(Math.ceil(formTitle.split(' ').length / 2)).join(' ')}
              </h1>
              {formDescription && (
                <p className="mt-4 text-white/90 max-w-md">{formDescription}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Survey Form */}
        <div className="md:w-1/2 bg-[#d3e4fd]/30 p-12 flex items-center">
          <div className="max-w-md mx-auto w-full">
            {/* Progress indicator */}
            <div className="h-1 w-full bg-gray-200 rounded-full mb-8">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    {currentStep + 1}. {currentField.label}
                  </h2>
                  
                  <DynamicInput
                    field={currentField}
                    value={answers[currentField.label]}
                    onChange={handleAnswer}
                    onSubmit={goToNextStep}
                    questionNumber={currentStep + 1}
                  />
                </div>
                
                <div className="flex flex-col items-center space-y-6 mt-8">
                  <Button 
                    onClick={goToNextStep}
                    disabled={currentField.required && !answers[currentField.label]}
                    className="w-full bg-[#1A2C55] hover:bg-[#0f1a33] text-white py-6 rounded-lg"
                  >
                    {currentStep < form.json_config.fields.length - 1 ? 'Next' : 'Submit'}
                  </Button>
                  
                  {currentStep < form.json_config.fields.length - 1 && (
                    <button 
                      onClick={goToNextStep}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Skip Question
                    </button>
                  )}

                  {currentStep > 0 && (
                    <button 
                      onClick={goToPreviousStep}
                      className="flex items-center text-gray-500 hover:text-gray-700 mt-2"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous Question
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
