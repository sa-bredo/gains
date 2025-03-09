
import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { MessageTemplate, MessageTemplateFormValues, MessageTemplateDB, SlackConfig, SlackEmployeeIntegration } from "../types";
import { useCompany } from "@/contexts/CompanyContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

// Message Templates service
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

// Slack Config service
export const useSlackConfig = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const fetchSlackConfig = async (): Promise<SlackConfig | null> => {
    if (!currentCompany) {
      return null;
    }
    
    const { data, error } = await supabase
      .from("config")
      .select("*")
      .eq("type", "slack")
      .maybeSingle();
      
    if (error) {
      throw new Error(`Error fetching Slack configuration: ${error.message}`);
    }
    
    return data ? data as SlackConfig : null;
  };
  
  const slackConfigQuery = useQuery({
    queryKey: ["slackConfig", currentCompany?.id],
    queryFn: fetchSlackConfig,
    enabled: !!currentCompany,
  });
  
  const refetchSlackConfig = () => {
    queryClient.invalidateQueries({ queryKey: ["slackConfig"] });
  };
  
  return {
    slackConfig: slackConfigQuery.data,
    isLoading: slackConfigQuery.isLoading,
    error: slackConfigQuery.error,
    refetchSlackConfig,
  };
};

// Slack Employees service
export const useSlackEmployees = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const fetchSlackEmployees = async (): Promise<SlackEmployeeIntegration[]> => {
    if (!currentCompany) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("employees")
      .select("id, employee_id, integrations")
      .eq("company_id", currentCompany.id);
      
    if (error) {
      throw new Error(`Error fetching employees with Slack integrations: ${error.message}`);
    }
    
    // Filter and transform employees with Slack integration data
    const slackEmployees = (data || [])
      .filter(employee => employee.integrations && 
              typeof employee.integrations === 'object' && 
              'slack' in (employee.integrations as any))
      .map(employee => {
        const slackData = (employee.integrations as any).slack || {};
        return {
          id: employee.id,
          employee_id: employee.employee_id,
          employee_name: slackData.employee_name || 'Unknown Employee',
          employee_email: slackData.employee_email || '',
          slack_user_id: slackData.slack_user_id,
          slack_channel_id: slackData.slack_channel_id,
          status: slackData.status || 'pending',
          error_message: slackData.error_message,
        } as SlackEmployeeIntegration;
      });
    
    return slackEmployees;
  };
  
  const connectEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await supabase.functions.invoke('connect-slack-employee', {
        body: { employee_id: employeeId }
      });
      
      if (error) {
        throw new Error(`Error connecting employee to Slack: ${error.message}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackEmployees"] });
      toast.success("Employee connected to Slack successfully");
    },
    onError: (error) => {
      toast.error(`Failed to connect employee to Slack: ${error.message}`);
    },
  });
  
  const disconnectEmployee = useMutation({
    mutationFn: async (employeeId: string) => {
      const { data, error } = await supabase
        .from("employees")
        .select("integrations")
        .eq("employee_id", employeeId)
        .maybeSingle();
      
      if (error) {
        throw new Error(`Error getting employee data: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Employee not found");
      }
      
      // Remove slack integration from the integrations object
      const integrations = data.integrations || {};
      if (typeof integrations === 'object' && 'slack' in (integrations as any)) {
        delete (integrations as any).slack;
      }
      
      const { error: updateError } = await supabase
        .from("employees")
        .update({ integrations })
        .eq("employee_id", employeeId);
      
      if (updateError) {
        throw new Error(`Error disconnecting employee from Slack: ${updateError.message}`);
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackEmployees"] });
      toast.success("Employee disconnected from Slack successfully");
    },
    onError: (error) => {
      toast.error(`Failed to disconnect employee from Slack: ${error.message}`);
    },
  });
  
  const slackEmployeesQuery = useQuery({
    queryKey: ["slackEmployees", currentCompany?.id],
    queryFn: fetchSlackEmployees,
    enabled: !!currentCompany,
  });
  
  const refetchSlackEmployees = () => {
    queryClient.invalidateQueries({ queryKey: ["slackEmployees"] });
  };
  
  return {
    slackEmployees: slackEmployeesQuery.data || [],
    isLoading: slackEmployeesQuery.isLoading,
    error: slackEmployeesQuery.error,
    connectEmployee,
    disconnectEmployee,
    refetchSlackEmployees,
  };
};
