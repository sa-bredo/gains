
import { supabase } from '@/integrations/supabase/client';
import { SlackConfig, SlackEmployeeIntegration, MessageTemplate, SlackChannelInfo } from '../types';

/**
 * Fetch Slack configuration for the current company
 */
export const fetchSlackConfig = async (companyId: string): Promise<SlackConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('company_id', companyId)
      .in('key', [
        'slack_workspace_id',
        'slack_bot_token',
        'slack_signing_secret',
        'slack_app_id',
        'slack_workspace_name',
        'slack_team_url',
        'slack_connected_at'
      ]);
    
    if (error) {
      console.error('Error fetching Slack config:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    // Transform the array of config items into a SlackConfig object
    const configMap: Record<string, string> = {};
    data.forEach(item => {
      configMap[item.key] = item.value;
    });
    
    if (!configMap.slack_workspace_id) {
      return null;
    }
    
    return {
      company_id: companyId,
      slack_workspace_id: configMap.slack_workspace_id,
      slack_bot_token: configMap.slack_bot_token || '',
      slack_signing_secret: configMap.slack_signing_secret || '',
      slack_app_id: configMap.slack_app_id || '',
      slack_workspace_name: configMap.slack_workspace_name || '',
      slack_team_url: configMap.slack_team_url || '',
      connected_at: configMap.slack_connected_at || new Date().toISOString()
    };
  } catch (err) {
    console.error('Exception in fetchSlackConfig:', err);
    return null;
  }
};

/**
 * Connect an employee to their Slack account
 */
export const connectEmployeeToSlack = async (
  employeeId: string, 
  workspaceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('connect-slack-employee', {
      body: { 
        employee_id: employeeId,
        workspace_id: workspaceId
      },
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error connecting employee to Slack:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Disconnect an employee from their Slack account
 */
export const disconnectEmployeeFromSlack = async (
  employeeId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Update the employee's integrations to remove slack connection
    const { error } = await supabase
      .from('employees')
      .update({
        integrations: supabase.rpc('jsonb_delete_path', { target: 'integrations', path: ['slack'] })
      })
      .eq('id', employeeId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error disconnecting employee from Slack:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Fetch all Slack channels for the workspace
 */
export const fetchSlackChannels = async (
  workspaceId: string
): Promise<{ channels: SlackChannelInfo[]; error?: string }> => {
  try {
    // Get the Slack bot token
    const { data: configData, error: configError } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'slack_bot_token')
      .eq('company_id', workspaceId)
      .single();
    
    if (configError) {
      return { channels: [], error: configError.message };
    }
    
    const slack_bot_token = configData.value;
    
    // Call Slack API to get channels
    const response = await fetch('https://slack.com/api/conversations.list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${slack_bot_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      return { channels: [], error: data.error };
    }
    
    // Format the response
    const channels: SlackChannelInfo[] = data.channels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      is_private: channel.is_private,
      member_count: channel.num_members || 0
    }));
    
    return { channels };
  } catch (err) {
    console.error('Error fetching Slack channels:', err);
    return { 
      channels: [], 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Send a Slack message to employees or a channel
 */
export const sendSlackMessage = async (
  recipientType: 'employee' | 'channel' | 'group',
  recipients: string[],
  message: string,
  workspaceId: string,
  userId: string
): Promise<{ success: boolean; error?: string; results?: any[] }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-slack-message', {
      body: {
        recipient_type: recipientType,
        recipients,
        message,
        workspace_id: workspaceId,
        user_id: userId
      },
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error sending Slack message:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Create a message template
 */
export const createMessageTemplate = async (
  template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; template?: MessageTemplate; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .insert([template])
      .select();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, template: data[0] as MessageTemplate };
  } catch (err) {
    console.error('Error creating message template:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Fetch message templates
 */
export const fetchMessageTemplates = async (type: 'slack' | 'email' | 'sms' = 'slack'): Promise<{ 
  templates: MessageTemplate[]; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { templates: [], error: error.message };
    }
    
    return { templates: data as MessageTemplate[] || [] };
  } catch (err) {
    console.error('Error fetching message templates:', err);
    return { 
      templates: [], 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Check if an employee is connected to Slack
 */
export const isEmployeeConnectedToSlack = async (
  employeeId: string
): Promise<{ connected: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('integrations')
      .eq('id', employeeId)
      .single();
    
    if (error) {
      return { connected: false, error: error.message };
    }
    
    return { 
      connected: !!data?.integrations?.slack?.slack_connected
    };
  } catch (err) {
    console.error('Error checking employee Slack connection:', err);
    return { 
      connected: false, 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Fetch employees with their Slack connection status
 */
export const fetchEmployeesWithSlackStatus = async (): Promise<{
  employees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    slack?: SlackEmployeeIntegration;
  }>;
  error?: string;
}> => {
  try {
    // Fetch employees with their integrations
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, role, integrations');
    
    if (employeesError) {
      return { employees: [], error: employeesError.message };
    }
    
    // Format the data
    const formattedEmployees = employeesData.map(employee => ({
      id: employee.id,
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      role: employee.role,
      slack: employee.integrations?.slack as SlackEmployeeIntegration || undefined
    }));
    
    return { employees: formattedEmployees };
  } catch (err) {
    console.error('Error fetching employees with Slack status:', err);
    return { 
      employees: [], 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};
