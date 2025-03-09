
import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { useCompany } from "@/contexts/CompanyContext";
import { SlackConfig, SlackEmployeeIntegration } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSlackConfig = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const fetchSlackConfig = async (): Promise<SlackConfig | null> => {
    if (!currentCompany?.id) {
      return null;
    }
    
    const { data, error } = await supabase
      .from("slack_configs")
      .select("*")
      .eq("company_id", currentCompany.id)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Error fetching Slack config: ${error.message}`);
    }
    
    return data;
  };
  
  const updateSlackConfig = async (config: Partial<SlackConfig>): Promise<SlackConfig> => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }
    
    const { data, error } = await supabase
      .from("slack_configs")
      .upsert({
        company_id: currentCompany.id,
        ...config
      })
      .select()
      .single();
      
    if (error) {
      throw new Error(`Error updating Slack config: ${error.message}`);
    }
    
    return data;
  };
  
  const deleteSlackConfig = async (): Promise<void> => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }
    
    const { error } = await supabase
      .from("slack_configs")
      .delete()
      .eq("company_id", currentCompany.id);
      
    if (error) {
      throw new Error(`Error deleting Slack config: ${error.message}`);
    }
  };
  
  const slackConfig = useQuery({
    queryKey: ["slackConfig", currentCompany?.id],
    queryFn: fetchSlackConfig,
    enabled: !!currentCompany,
  });
  
  const updateConfig = useMutation({
    mutationFn: updateSlackConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackConfig"] });
      toast.success("Slack configuration updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update Slack configuration: ${error.message}`);
    },
  });
  
  const removeConfig = useMutation({
    mutationFn: deleteSlackConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackConfig"] });
      toast.success("Slack configuration removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to remove Slack configuration: ${error.message}`);
    },
  });
  
  return {
    slackConfig: slackConfig.data,
    isLoading: slackConfig.isLoading,
    error: slackConfig.error,
    updateConfig,
    removeConfig,
    refetch: slackConfig.refetch,
  };
};

export const useSlackEmployees = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  
  const fetchSlackEmployees = async () => {
    if (!currentCompany?.id) {
      return [];
    }
    
    // First, get all employees for this company
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, first_name, last_name, email")
      .eq("company_id", currentCompany.id);
      
    if (employeesError) {
      throw new Error(`Error fetching employees: ${employeesError.message}`);
    }
    
    // Then, get all Slack integrations for these employees
    const { data: slackIntegrations, error: integrationsError } = await supabase
      .from("slack_employee_integrations")
      .select("*")
      .eq("company_id", currentCompany.id);
      
    if (integrationsError) {
      throw new Error(`Error fetching Slack integrations: ${integrationsError.message}`);
    }
    
    // Merge the data
    return employees.map((employee) => {
      const integration = slackIntegrations?.find(
        (integration) => integration.employee_id === employee.id
      );
      
      return {
        ...employee,
        slack_user_id: integration?.slack_user_id || null,
        slack_channel_id: integration?.slack_channel_id || null,
        slack_connected: !!integration?.slack_user_id,
        slack_status: integration?.status || "pending",
        slack_error: integration?.error_message,
      };
    });
  };
  
  const connectEmployeeToSlack = async (employeeId: string, companyId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("connect-slack-employee", {
        body: { employee_id: employeeId, workspace_id: companyId }
      });
      
      if (error) {
        throw new Error(`Error connecting employee to Slack: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error("Error connecting employee to Slack:", error);
      throw error;
    }
  };
  
  const disconnectEmployeeFromSlack = async (employeeId: string) => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }
    
    const { error } = await supabase
      .from("slack_employee_integrations")
      .delete()
      .eq("employee_id", employeeId)
      .eq("company_id", currentCompany.id);
      
    if (error) {
      throw new Error(`Error disconnecting employee from Slack: ${error.message}`);
    }
    
    return true;
  };
  
  const getSlackConfig = async (companyId: string): Promise<SlackConfig | null> => {
    const { data, error } = await supabase
      .from("slack_configs")
      .select("*")
      .eq("company_id", companyId)
      .maybeSingle();
      
    if (error) {
      throw new Error(`Error fetching Slack config: ${error.message}`);
    }
    
    return data;
  };
  
  const employees = useQuery({
    queryKey: ["slackEmployees", currentCompany?.id],
    queryFn: fetchSlackEmployees,
    enabled: !!currentCompany,
  });
  
  return {
    employees: employees.data || [],
    isLoading: employees.isLoading,
    error: employees.error,
    refetch: employees.refetch,
    connectEmployeeToSlack,
    disconnectEmployeeFromSlack,
    getSlackConfig,
    getSlackEmployees: fetchSlackEmployees,
  };
};
