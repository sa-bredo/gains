
import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { MessageTemplate, MessageTemplateFormValues, MessageTemplateDB } from "../types";
import { useCompany } from "@/contexts/CompanyContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMessageTemplates = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const fetchMessageTemplates = async (): Promise<MessageTemplate[]> => {
    if (!currentCompany) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("message_templates")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw new Error(`Error fetching message templates: ${error.message}`);
    }
    
    // Convert database types to our TypeScript types
    return (data || []).map((template: MessageTemplateDB) => ({
      ...template,
      type: template.type as 'slack' | 'email' | 'sms'
    }));
  };
  
  const createMessageTemplate = async (template: MessageTemplateFormValues): Promise<MessageTemplate> => {
    // Ensure all required fields are present
    const templateToInsert = {
      name: template.name,
      content: template.content,
      type: template.type,
      category: template.category
    };
    
    const { data, error } = await supabase
      .from("message_templates")
      .insert(templateToInsert)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error creating message template: ${error.message}`);
    }
    
    return {
      ...data,
      type: data.type as 'slack' | 'email' | 'sms'
    };
  };
  
  const updateMessageTemplate = async ({ id, ...template }: MessageTemplate): Promise<MessageTemplate> => {
    const { data, error } = await supabase
      .from("message_templates")
      .update(template)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating message template: ${error.message}`);
    }
    
    return {
      ...data,
      type: data.type as 'slack' | 'email' | 'sms'
    };
  };
  
  const deleteMessageTemplate = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("message_templates")
      .delete()
      .eq("id", id);
      
    if (error) {
      throw new Error(`Error deleting message template: ${error.message}`);
    }
  };
  
  const templates = useQuery({
    queryKey: ["messageTemplates", currentCompany?.id],
    queryFn: fetchMessageTemplates,
    enabled: !!currentCompany,
  });
  
  const createTemplate = useMutation({
    mutationFn: createMessageTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageTemplates"] });
      toast.success("Template created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });
  
  const updateTemplate = useMutation({
    mutationFn: updateMessageTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageTemplates"] });
      toast.success("Template updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update template: ${error.message}`);
    },
  });
  
  const deleteTemplate = useMutation({
    mutationFn: deleteMessageTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messageTemplates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });
  
  return {
    templates: templates.data || [],
    isLoading: templates.isLoading,
    error: templates.error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
