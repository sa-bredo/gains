
import { v4 as uuidv4 } from 'uuid';
import { FormConfig, Form, FormSubmission } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const useFormService = () => {
  // Fetch all forms for the current user
  const fetchForms = async (): Promise<Form[]> => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Cast the JSON data to our FormConfig type
      return data.map(form => ({
        ...form,
        json_config: form.json_config as unknown as FormConfig
      })) as Form[];
    } catch (error) {
      console.error('Error fetching forms:', error);
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
        throw error;
      }

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
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('public_url', publicUrl)
        .single();

      if (error) {
        throw error;
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
      const { data, error } = await supabase
        .from('forms')
        .insert({
          title: formData.title,
          description: formData.description,
          public_url: formData.public_url,
          json_config: formData.json_config as unknown as any
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

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
      const updateData: any = { ...formData };
      if (formData.json_config) {
        updateData.json_config = formData.json_config as unknown as any;
      }

      const { data, error } = await supabase
        .from('forms')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

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
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  };

  // Submit form data
  const submitForm = async (formId: string, data: Record<string, any>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: formId,
          data,
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      throw error;
    }
  };

  // Fetch submissions for a form
  const fetchFormSubmissions = async (formId: string): Promise<FormSubmission[]> => {
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }

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
  };
};
