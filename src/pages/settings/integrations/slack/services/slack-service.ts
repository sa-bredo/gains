
import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlackConfig, SlackEmployeeIntegration } from "../types";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";

export const useSlackConfig = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const fetchSlackConfig = async (): Promise<SlackConfig | null> => {
    if (!currentCompany?.id) return null;

    // Get the bot token from config table
    const { data: botTokenData, error: botTokenError } = await supabase
      .from("config")
      .select("value")
      .eq("key", "slack_bot_token")
      .eq("company_id", currentCompany.id)
      .maybeSingle();

    if (botTokenError) {
      console.error("Error fetching Slack bot token:", botTokenError);
      return null;
    }

    // Get team details from config if they exist
    const { data: teamData, error: teamError } = await supabase
      .from("config")
      .select("key, value")
      .in("key", ["slack_team_id", "slack_team_name"])
      .eq("company_id", currentCompany.id);

    if (teamError) {
      console.error("Error fetching Slack team details:", teamError);
    }

    // Build the config object from separate config entries
    const config: SlackConfig = {
      id: undefined,
      company_id: currentCompany.id,
      bot_token: botTokenData?.value,
      team_id: teamData?.find(item => item.key === "slack_team_id")?.value,
      team_name: teamData?.find(item => item.key === "slack_team_name")?.value,
      access_token: undefined,
      scope: undefined,
    };

    return config;
  };

  const updateSlackConfig = async (config: Partial<SlackConfig>): Promise<SlackConfig> => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }

    // We need to update or create each config entry separately
    const configEntries = [
      { key: "slack_bot_token", value: config.bot_token, display_name: "Slack Bot Token" },
      { key: "slack_team_id", value: config.team_id, display_name: "Slack Team ID" },
      { key: "slack_team_name", value: config.team_name, display_name: "Slack Team Name" },
    ];

    for (const entry of configEntries) {
      if (!entry.value) continue;

      // Check if entry exists
      const { data: existingEntry, error: fetchError } = await supabase
        .from("config")
        .select("id")
        .eq("key", entry.key)
        .eq("company_id", currentCompany.id)
        .maybeSingle();

      if (fetchError) {
        console.error(`Error checking if ${entry.key} exists:`, fetchError);
      }

      if (existingEntry) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from("config")
          .update({ value: entry.value })
          .eq("id", existingEntry.id);

        if (updateError) {
          throw new Error(`Failed to update ${entry.key}: ${updateError.message}`);
        }
      } else {
        // Create new entry
        const { error: insertError } = await supabase
          .from("config")
          .insert({
            key: entry.key,
            value: entry.value,
            display_name: entry.display_name,
            company_id: currentCompany.id
          });

        if (insertError) {
          throw new Error(`Failed to create ${entry.key}: ${insertError.message}`);
        }
      }
    }

    // Return the updated config
    return {
      ...config,
      company_id: currentCompany.id,
    } as SlackConfig;
  };

  const slackConfig = useQuery({
    queryKey: ["slackConfig", currentCompany?.id],
    queryFn: fetchSlackConfig,
    enabled: !!currentCompany?.id,
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

  return {
    slackConfig: slackConfig.data,
    isLoading: slackConfig.isLoading,
    error: slackConfig.error,
    updateConfig,
    refetchSlackConfig: slackConfig.refetch,
  };
};

export const useSlackEmployees = () => {
  const supabase = useSupabaseClient();
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  const fetchSlackEmployees = async (): Promise<SlackEmployeeIntegration[]> => {
    if (!currentCompany?.id) return [];

    // Get employees with their integrations data
    const { data, error } = await supabase
      .from("employees")
      .select("id, email, first_name, last_name, integrations")
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching employees:", error);
      throw new Error(`Error fetching employees: ${error.message}`);
    }

    // Map to SlackEmployeeIntegration format
    return data.map((employee) => {
      const slackInfo = employee.integrations?.slack || {};
      
      return {
        id: employee.id,
        employee_id: employee.id,
        company_id: currentCompany.id,
        slack_user_id: slackInfo.slack_user_id,
        slack_channel_id: slackInfo.slack_channel_id,
        status: slackInfo.slack_connected ? 'connected' : 'pending',
        error_message: slackInfo.error_message,
        created_at: slackInfo.slack_connected_at,
        updated_at: undefined,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        employee_email: employee.email
      };
    });
  };

  const connectEmployeeToSlack = async (employee_id: string): Promise<void> => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }

    try {
      const { data, error } = await supabase.functions.invoke('connect-slack-employee', {
        body: { employee_id, workspace_id: currentCompany.id }
      });

      if (error) {
        throw new Error(`Error connecting employee to Slack: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to connect employee to Slack");
      }

      toast.success("Employee connected to Slack successfully");
    } catch (err) {
      console.error("Error connecting employee to Slack:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to connect employee to Slack: ${errorMessage}`);
      throw err;
    }
  };

  const disconnectEmployeeFromSlack = async (employee_id: string): Promise<void> => {
    if (!currentCompany?.id) {
      throw new Error("No company selected");
    }

    try {
      // Update the employee record to remove Slack integration
      const { error } = await supabase
        .from("employees")
        .update({
          integrations: supabase.rpc('jsonb_delete_path', {
            target: 'integrations',
            path: ['slack']
          })
        })
        .eq("id", employee_id);

      if (error) {
        throw new Error(`Error disconnecting employee from Slack: ${error.message}`);
      }

      toast.success("Employee disconnected from Slack successfully");
    } catch (err) {
      console.error("Error disconnecting employee from Slack:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to disconnect employee from Slack: ${errorMessage}`);
      throw err;
    }
  };

  const slackEmployees = useQuery({
    queryKey: ["slackEmployees", currentCompany?.id],
    queryFn: fetchSlackEmployees,
    enabled: !!currentCompany?.id,
  });

  const connectEmployee = useMutation({
    mutationFn: connectEmployeeToSlack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackEmployees"] });
    },
  });

  const disconnectEmployee = useMutation({
    mutationFn: disconnectEmployeeFromSlack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slackEmployees"] });
    },
  });

  return {
    slackEmployees: slackEmployees.data || [],
    isLoading: slackEmployees.isLoading,
    error: slackEmployees.error,
    connectEmployee,
    disconnectEmployee,
    refetchSlackEmployees: slackEmployees.refetch,
  };
};
