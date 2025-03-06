
import { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormField, FormConfig, FieldType, Form } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useFormService } from "../services/form-service";

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
  
  const { toast } = useToast();
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
      toast({
        title: "Error",
        description: "Please provide a form title",
        variant: "destructive"
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one field to your form",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const formConfig: FormConfig = {
        title,
        description: description || undefined,
        fields
      };
      
      if (initialForm) {
        await formService.updateForm(initialForm.id, {
          title,
          description: description || null,
          json_config: formConfig
        });
        
        toast({
          title: "Success",
          description: "Form updated successfully"
        });
      } else {
        const newForm = await formService.createForm({
          title,
          description: description || null,
          public_url: formService.generatePublicUrl(),
          json_config: formConfig
        });
        
        toast({
          title: "Success",
          description: "Form created successfully"
        });
        
        navigate(`/forms/${newForm.id}`);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [title, description, fields, initialForm, formService, toast, navigate]);

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
