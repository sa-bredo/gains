
import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { MessageTemplate, MessageTemplateFormValues, MessageTemplateDB, SlackConfig, SlackEmployeeIntegration } from "../types";
import { useCompany } from "@/contexts/CompanyContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    
    // Use first_name, last_name, email from employees table directly
    const { data, error } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email, integrations")
      .eq("company_id", currentCompany.id);
      
    if (error) {
      throw new Error(`Error fetching employees with Slack integrations: ${error.message}`);
    }
    
    // Filter and transform employees with Slack integration data
    const slackEmployees = (data || [])
      .filter(employee => employee.integrations && 
              typeof employee.integrations === 'object' && 
              'slack' in employee.integrations)
      .map(employee => {
        const slackData = employee.integrations.slack || {};
        return {
          id: employee.id,
          employee_id: employee.id, // Using id as employee_id
          employee_name: `${employee.first_name} ${employee.last_name}`,
          employee_email: employee.email,
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
      if (!currentCompany?.id) {
        throw new Error("No workspace selected");
      }
      
      const { error } = await supabase.functions.invoke('connect-slack-employee', {
        body: { 
          employee_id: employeeId,
          workspace_id: currentCompany.id
        }
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
      // First get the current integrations data
      const { data, error } = await supabase
        .from("employees")
        .select("integrations")
        .eq("id", employeeId) // Using id instead of employee_id
        .maybeSingle();
      
      if (error) {
        throw new Error(`Error getting employee data: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("Employee not found");
      }
      
      // Create a new integrations object without slack
      const integrations = { ...data.integrations };
      if (typeof integrations === 'object' && integrations !== null && 'slack' in integrations) {
        delete integrations.slack;
      }
      
      // Update the employee record
      const { error: updateError } = await supabase
        .from("employees")
        .update({ integrations })
        .eq("id", employeeId);
      
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
