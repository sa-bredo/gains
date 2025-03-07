
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormField } from "../types";
import { useFormService } from "../services/form-service";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DynamicInput } from "./dynamic-input";
import { useIsMobile } from "@/hooks/use-mobile";

interface PublicFormViewProps {
  publicUrl: string;
  isPreview?: boolean;
}

export const PublicFormView: React.FC<PublicFormViewProps> = ({ publicUrl, isPreview = false }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showMobileForm, setShowMobileForm] = useState(false);
  
  const formFetched = useRef(false);
  const isMounted = useRef(true);
  const isMobile = useIsMobile();

  const { toast } = useToast();
  const formService = useFormService();

  useEffect(() => {
    isMounted.current = true;
    
    const fetchForm = async () => {
      if (formFetched.current || !isMounted.current) return;
      
      try {
        console.log(`Fetching form with public URL: ${publicUrl}`);
        formFetched.current = true;
        
        const formData = isPreview 
          ? await formService.fetchFormById(publicUrl) 
          : await formService.fetchFormByPublicUrl(publicUrl);
        
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
          setError(isPreview 
            ? "Could not load form preview. Please try again." 
            : "Form not found. Please check the URL.");
        }
      }
    };

    fetchForm();
    
    return () => {
      console.log("PublicFormView unmounting");
      isMounted.current = false;
    };
  }, [publicUrl, formService, isPreview]);

  useEffect(() => {
    if (form && form.json_config.fields.length > 0) {
      const totalFields = form.json_config.fields.length;
      setProgress((currentStep / totalFields) * 100);
    }
  }, [currentStep, form]);

  const handleAnswer = (value: any) => {
    if (!form) return;
    
    const currentField = form.json_config.fields[currentStep];
    
    if (currentField.type === "checkbox") {
      setAnswers(prev => ({
        ...prev,
        [currentField.label]: Array.isArray(value) ? value : []
      }));
    } else if (currentField.type === "multiple_choice") {
      setAnswers(prev => ({
        ...prev,
        [currentField.label]: value
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentField.label]: value
      }));
    }
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
    } else if (isMobile && showMobileForm) {
      // On mobile, go back to the cover screen
      setShowMobileForm(false);
    }
  };

  const startMobileForm = () => {
    setShowMobileForm(true);
  };

  const handleSubmit = async () => {
    if (!form) return;
    
    if (isPreview) {
      setIsComplete(true);
      return;
    }
    
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
      <div className="h-screen w-full flex">
        <div className="flex flex-col md:flex-row w-full h-full">
          {!isMobile && (
            <div className="md:w-1/2 relative h-full">
              <div className="h-full">
                <img
                  src={form.json_config.coverImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
                  alt={form.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="rounded-xl p-8 max-w-md"
                    style={{ 
                      backgroundColor: `${form.json_config.appearance?.backgroundColor || '#000000'}${Math.round((form.json_config.appearance?.backgroundOpacity || 10) * 255 / 100).toString(16).padStart(2, '0')}`,
                    }}
                  >
                    <h1 
                      className="text-5xl font-bold leading-tight"
                      style={{ color: form.json_config.appearance?.titleColor || "#FFFFFF" }}
                    >
                      {form.title}
                    </h1>
                    {form.description && (
                      <p 
                        className="mt-4 max-w-md"
                        style={{ color: form.json_config.appearance?.textColor || "#FFFFFF" }}
                      >
                        {form.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`${isMobile ? 'w-full' : 'md:w-1/2'} bg-white h-full overflow-y-auto flex flex-col`}>
            <div className="p-8 md:p-12 flex flex-col items-center justify-center h-full">
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
              <div className="text-center max-w-md">
                <h2 className="text-3xl font-bold mb-4">
                  {form?.json_config.completionMessage?.title || "Thank you!"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {form?.json_config.completionMessage?.description || "Your response has been submitted successfully."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile landing screen (cover image)
  if (isMobile && !showMobileForm) {
    return (
      <div className="h-screen w-full relative overflow-hidden">
        <div className="h-full">
          <img
            src={form.json_config.coverImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
            alt={form.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <h1 
              className="text-4xl font-bold leading-tight mb-4"
              style={{ color: form.json_config.appearance?.titleColor || "#FFFFFF" }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p 
                className="mb-8 max-w-md"
                style={{ color: form.json_config.appearance?.textColor || "#FFFFFF" }}
              >
                {form.description}
              </p>
            )}
            <Button 
              onClick={startMobileForm} 
              size="lg" 
              className="rounded-full mt-4 px-8 py-6 h-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {form.json_config.mobileButtonText || "Tell Us About You"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentField = form.json_config.fields[currentStep];
  const hasFieldsToShow = form.json_config.fields.length > 0;
  const hasCoverImage = !!form.json_config.coverImage;
  const formTitle = form.title;
  const formDescription = form.description || "";
  
  const appearance = form.json_config.appearance || { 
    backgroundOpacity: 10, 
    titleColor: "#FFFFFF", 
    textColor: "#FFFFFF" 
  };

  // Desktop form or Mobile questions view
  return (
    <div className="h-screen w-full flex">
      <div className="flex flex-col md:flex-row w-full h-full">
        {!isMobile && (
          <div className="md:w-1/2 relative h-full">
            <div className="h-full">
              <img
                src={form.json_config.coverImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"}
                alt={formTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="rounded-xl p-8 max-w-md"
                  style={{ 
                    backgroundColor: `${appearance.backgroundColor || '#000000'}${Math.round((appearance.backgroundOpacity || 10) * 255 / 100).toString(16).padStart(2, '0')}`,
                  }}
                >
                  <h1 
                    className="text-5xl font-bold leading-tight"
                    style={{ color: appearance.titleColor || "#FFFFFF" }}
                  >
                    {formTitle}
                  </h1>
                  {formDescription && (
                    <p 
                      className="mt-4 max-w-md"
                      style={{ color: appearance.textColor || "#FFFFFF" }}
                    >
                      {formDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`${isMobile ? 'w-full' : 'md:w-1/2'} ${isMobile ? 'bg-white' : 'bg-[#d3e4fd]/30'} h-full overflow-y-auto flex flex-col`}>
          {isMobile && (
            <div className="p-4 pt-6">
              <button 
                onClick={goToPreviousStep}
                className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            </div>
          )}
          
          <div className={`p-6 ${isMobile ? 'pt-0' : 'p-12'} flex flex-col flex-grow`}>
            {!isMobile && (
              <div className="mb-12">
                <div className="h-1 w-full bg-gray-200 rounded-full flex items-center justify-center">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex-grow flex flex-col">
              <div className="max-w-md mx-auto w-full">
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
                      <DynamicInput
                        field={currentField}
                        value={answers[currentField.label]}
                        onChange={handleAnswer}
                        onSubmit={goToNextStep}
                        questionNumber={currentStep + 1}
                      />
                    </div>
                    
                    {!isMobile && currentStep > 0 && (
                      <div className="flex flex-col items-center space-y-6 mt-8">
                        <button 
                          onClick={goToPreviousStep}
                          className="flex items-center text-gray-500 hover:text-gray-700 mt-2"
                        >
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Previous Question
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
