
import { supabase } from "@/integrations/supabase/client";
import { Form, FormConfig, FormSubmission } from "../types";
import { v4 as uuidv4 } from 'uuid';

export const useFormService = () => {
  // Fetch all forms
  const fetchForms = async (): Promise<Form[]> => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching forms:', error);
        throw error;
      }

      return data as Form[];
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      throw error;
    }
  };

  // Fetch a single form by ID
  const fetchFormById = async (id: string): Promise<Form> => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching form with ID ${id}:`, error);
        throw error;
      }

      return data as Form;
    } catch (error) {
      console.error(`Failed to fetch form with ID ${id}:`, error);
      throw error;
    }
  };

  // Fetch a form by public URL
  const fetchFormByUrl = async (publicUrl: string): Promise<Form> => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('public_url', publicUrl)
        .single();

      if (error) {
        console.error(`Error fetching form with URL ${publicUrl}:`, error);
        throw error;
      }

      return data as Form;
    } catch (error) {
      console.error(`Failed to fetch form with URL ${publicUrl}:`, error);
      throw error;
    }
  };

  // Create a new form
  const createForm = async (title: string, description: string | null, formConfig: FormConfig): Promise<Form> => {
    try {
      // Generate a random URL slug
      const publicUrl = generateRandomSlug();

      const { data, error } = await supabase
        .from('forms')
        .insert({
          title,
          description,
          public_url: publicUrl,
          json_config: formConfig
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating form:', error);
        throw error;
      }

      return data as Form;
    } catch (error) {
      console.error('Failed to create form:', error);
      throw error;
    }
  };

  // Update an existing form
  const updateForm = async (id: string, updates: Partial<Form>): Promise<Form> => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating form with ID ${id}:`, error);
        throw error;
      }

      return data as Form;
    } catch (error) {
      console.error(`Failed to update form with ID ${id}:`, error);
      throw error;
    }
  };

  // Delete a form
  const deleteForm = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting form with ID ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Failed to delete form with ID ${id}:`, error);
      throw error;
    }
  };

  // Submit form data
  const submitFormResponse = async (formId: string, data: Record<string, any>): Promise<FormSubmission> => {
    try {
      const { data: submission, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          data
        })
        .select()
        .single();

      if (error) {
        console.error(`Error submitting form response for form ID ${formId}:`, error);
        throw error;
      }

      return submission as FormSubmission;
    } catch (error) {
      console.error(`Failed to submit form response for form ID ${formId}:`, error);
      throw error;
    }
  };

  // Fetch form submissions for a form
  const fetchFormSubmissions = async (formId: string): Promise<FormSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error(`Error fetching submissions for form ID ${formId}:`, error);
        throw error;
      }

      return data as FormSubmission[];
    } catch (error) {
      console.error(`Failed to fetch submissions for form ID ${formId}:`, error);
      throw error;
    }
  };

  // Helper function to generate a random URL slug
  const generateRandomSlug = (): string => {
    // Generate a short, readable ID
    return uuidv4().substring(0, 8);
  };

  return {
    fetchForms,
    fetchFormById,
    fetchFormByUrl,
    createForm,
    updateForm,
    deleteForm,
    submitFormResponse,
    fetchFormSubmissions
  };
};
