
import { v4 as uuidv4 } from 'uuid';
import { FormConfig, Form, FormSubmission } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Create a cache for recently fetched forms
let formsCache: Form[] | null = null;
let formsCacheTimestamp: number | null = null;
const CACHE_EXPIRY_MS = 30000; // 30 seconds

export const useFormService = () => {
  // Fetch all forms for the current user
  const fetchForms = async (): Promise<Form[]> => {
    try {
      // Check if we have a valid cache
      const now = Date.now();
      if (formsCache && formsCacheTimestamp && (now - formsCacheTimestamp < CACHE_EXPIRY_MS)) {
        console.log('Using cached forms data');
        return formsCache;
      }

      console.log('Fetching forms from Supabase');
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching forms:', error);
        throw error;
      }

      console.log('Forms fetched successfully:', data);
      
      // Update cache
      const formData = data.map(form => ({
        ...form,
        json_config: form.json_config as unknown as FormConfig
      })) as Form[];
      
      formsCache = formData;
      formsCacheTimestamp = now;
      
      return formData;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  };

  // Clear the forms cache
  const clearFormsCache = () => {
    formsCache = null;
    formsCacheTimestamp = null;
  };

  // Fetch a single form by ID
  const fetchFormById = async (id: string): Promise<Form> => {
    try {
      console.log(`Fetching form with ID: ${id}`);
      // Using maybeSingle() instead of single() to handle case where form doesn't exist
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error(`Supabase error fetching form with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        console.error(`No form found with ID: ${id}`);
        throw new Error('Form not found');
      }

      console.log(`Form with ID ${id} fetched successfully:`, data);
      return {
        ...data,
        json_config: data.json_config as unknown as FormConfig
      } as Form;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  };

  // Fetch a form by its public URL
  const fetchFormByPublicUrl = async (publicUrl: string): Promise<Form> => {
    try {
      // Using maybeSingle() instead of single() to handle case where form doesn't exist
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('public_url', publicUrl)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Form not found with the provided public URL');
      }

      return {
        ...data,
        json_config: data.json_config as unknown as FormConfig
      } as Form;
    } catch (error) {
      console.error('Error fetching form by public URL:', error);
      throw error;
    }
  };

  // Create a new form
  const createForm = async (formData: Omit<Form, 'id' | 'created_at' | 'updated_at'>): Promise<Form> => {
    try {
      console.log('Creating new form with data:', formData);
      const { data, error } = await supabase
        .from('forms')
        .insert({
          title: formData.title,
          description: formData.description,
          public_url: formData.public_url,
          json_config: formData.json_config as unknown as any
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating form:', error);
        throw error;
      }

      if (!data) {
        console.error('No data returned after form creation');
        throw new Error('Failed to create form - no data returned');
      }

      console.log('Form created successfully:', data);
      
      // Clear cache after creating a new form
      clearFormsCache();

      return {
        ...data,
        json_config: data.json_config as unknown as FormConfig
      } as Form;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  };

  // Update an existing form
  const updateForm = async (id: string, formData: Partial<Form>): Promise<Form> => {
    try {
      console.log(`Updating form with ID: ${id}`, formData);
      const updateData: any = { ...formData };
      if (formData.json_config) {
        updateData.json_config = formData.json_config as unknown as any;
      }

      const { data, error } = await supabase
        .from('forms')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        console.error(`Error updating form with ID ${id}:`, error);
        throw error;
      }

      if (!data) {
        console.error(`No data returned after updating form with ID ${id}`);
        throw new Error(`Failed to update form with ID ${id} - no data returned`);
      }

      console.log(`Form with ID ${id} updated successfully:`, data);
      
      // Clear cache after updating a form
      clearFormsCache();

      return {
        ...data,
        json_config: data.json_config as unknown as FormConfig
      } as Form;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  };

  // Delete a form
  const deleteForm = async (id: string): Promise<void> => {
    try {
      console.log(`Deleting form with ID: ${id}`);
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting form with ID ${id}:`, error);
        throw error;
      }
      
      console.log(`Form with ID ${id} deleted successfully`);
      
      // Clear cache after deleting a form
      clearFormsCache();
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  };

  // Submit form data
  const submitForm = async (formId: string, data: Record<string, any>): Promise<void> => {
    try {
      console.log(`Submitting data for form with ID: ${formId}`, data);
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          data,
        });

      if (error) {
        console.error(`Error submitting data for form with ID ${formId}:`, error);
        throw error;
      }
      
      console.log(`Data for form with ID ${formId} submitted successfully`);
    } catch (error) {
      console.error('Error submitting form data:', error);
      throw error;
    }
  };

  // Fetch submissions for a form
  const fetchFormSubmissions = async (formId: string): Promise<FormSubmission[]> => {
    try {
      console.log(`Fetching submissions for form with ID: ${formId}`);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error(`Error fetching submissions for form with ID ${formId}:`, error);
        throw error;
      }
      
      console.log(`Submissions for form with ID ${formId} fetched successfully:`, data);
      return data as FormSubmission[];
    } catch (error) {
      console.error('Error fetching form submissions:', error);
      throw error;
    }
  };

  // Generate a unique public URL
  const generatePublicUrl = (): string => {
    return uuidv4().substring(0, 8);
  };

  return {
    fetchForms,
    fetchFormById,
    fetchFormByPublicUrl,
    createForm,
    updateForm,
    deleteForm,
    submitForm,
    fetchFormSubmissions,
    generatePublicUrl,
    clearFormsCache,
  };
};
