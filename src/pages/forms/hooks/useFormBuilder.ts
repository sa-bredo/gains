
import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormField, FormConfig, FieldType, Form } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFormService } from "../services/form-service";
import { toast } from "sonner";

interface UseFormBuilderProps {
  initialForm?: Form;
}

export const useFormBuilder = ({ initialForm }: UseFormBuilderProps = {}) => {
  // Use refs to store initial values to prevent re-renders
  const initialValueRef = useRef({
    title: initialForm?.title || "",
    description: initialForm?.description || "",
    fields: initialForm?.json_config?.fields || [],
  });
  
  // State management
  const [title, setTitle] = useState(initialValueRef.current.title);
  const [description, setDescription] = useState(initialValueRef.current.description);
  const [fields, setFields] = useState<FormField[]>(initialValueRef.current.fields);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const formService = useFormService();
  
  // Track if the component has been initialized
  const isInitialized = useRef(false);

  // Properly handle initialization with cleanup
  useEffect(() => {
    if (initialForm && !isInitialized.current) {
      console.log("Initializing form builder with form:", initialForm.id);
      
      // Only set these values during initialization
      setTitle(initialForm.title);
      setDescription(initialForm.description || "");
      setFields(initialForm.json_config.fields || []);
      
      isInitialized.current = true;
    }
    
    // Cleanup function
    return () => {
      console.log("Cleaning up form builder");
    };
  }, [initialForm]);

  // Memoize callbacks to prevent unnecessary re-renders
  const addField = useCallback((type: FieldType) => {
    const newField: FormField = {
      id: uuidv4(),
      type,
      label: `Question ${fields.length + 1}`,
      required: false,
      options: type === "multiple_choice" || type === "checkbox" ? ["Option 1"] : undefined
    };
    
    setFields(prevFields => [...prevFields, newField]);
    setEditingField(newField);
  }, [fields.length]);

  const duplicateField = useCallback((field: FormField) => {
    const duplicatedField: FormField = {
      ...field,
      id: uuidv4(),
      label: `${field.label} (Copy)`
    };
    
    setFields(prevFields => {
      const index = prevFields.findIndex(f => f.id === field.id);
      const updatedFields = [...prevFields];
      updatedFields.splice(index + 1, 0, duplicatedField);
      return updatedFields;
    });
  }, []);

  const updateField = useCallback((updatedField: FormField) => {
    setFields(prevFields => 
      prevFields.map(field => field.id === updatedField.id ? updatedField : field)
    );
    
    setEditingField(prevEditingField => 
      prevEditingField?.id === updatedField.id ? updatedField : prevEditingField
    );
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setFields(prevFields => prevFields.filter(field => field.id !== fieldId));
    
    setEditingField(prevEditingField => 
      prevEditingField?.id === fieldId ? null : prevEditingField
    );
  }, []);

  const updateFieldsOrder = useCallback((reorderedFields: FormField[]) => {
    setFields(reorderedFields);
  }, []);

  const saveForm = useCallback(async () => {
    if (!title.trim()) {
      // Show error toast using both toast systems for visibility
      uiToast({
        title: "Form Error",
        description: "Please provide a form title",
        variant: "destructive"
      });
      
      toast.error("Please provide a form title");
      return;
    }

    if (fields.length === 0) {
      uiToast({
        title: "Form Error",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      
      toast.error("Please add at least one field to your form");
      return;
    }

    try {
      setIsSaving(true);
      console.log("Attempting to save form...");
      
      const formConfig: FormConfig = {
        title,
        description: description || undefined,
        fields
      };
      
      if (initialForm) {
        console.log(`Updating existing form with ID: ${initialForm.id}`);
        const updatedForm = await formService.updateForm(initialForm.id, {
          title,
          description: description || null,
          json_config: formConfig
        });
        
        console.log("Form updated successfully:", updatedForm);
        
        // Show success toast using both toast systems for maximum visibility
        uiToast({
          title: "Success!",
          description: "Your form has been updated successfully",
          variant: "default"
        });
        
        toast.success("Form updated successfully!");
      } else {
        console.log("Creating new form...");
        const publicUrl = formService.generatePublicUrl();
        console.log(`Generated public URL: ${publicUrl}`);
        
        const newForm = await formService.createForm({
          title,
          description: description || null,
          public_url: publicUrl,
          json_config: formConfig
        });
        
        console.log("New form created:", newForm);
        
        // Show success toast using both toast systems for maximum visibility
        uiToast({
          title: "Success!",
          description: "Your new form has been created successfully",
          variant: "default"
        });
        
        toast.success("Form created successfully!");
        
        navigate(`/forms/${newForm.id}`);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      let errorMessage = "Failed to save form";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      // Show error toast using both toast systems
      uiToast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [title, description, fields, initialForm, formService, uiToast, navigate]);

  return {
    title,
    description,
    fields,
    editingField,
    isSaving,
    setTitle,
    setDescription,
    setEditingField,
    addField,
    duplicateField,
    updateField,
    removeField,
    updateFieldsOrder,
    saveForm
  };
};
