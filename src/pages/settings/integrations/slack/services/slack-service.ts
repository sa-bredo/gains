
import { supabase } from '@/integrations/supabase/client';
import { SlackConfig, SlackEmployee, SlackMessageTemplate, SlackMessage, SlackChannelInfo } from '../types';

/**
 * Fetch Slack configuration for the current company
 */
export const fetchSlackConfig = async (companyId: string): Promise<SlackConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('slack_config')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (error) {
      console.error('Error fetching Slack config:', error);
      return null;
    }
    
    return data;
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
    const { data, error } = await supabase.functions.invoke('disconnect-slack-employee', {
      body: { employee_id: employeeId },
    });
    
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
    const { data, error } = await supabase.functions.invoke('get-slack-channels', {
      body: { workspace_id: workspaceId },
    });
    
    if (error) {
      return { channels: [], error: error.message };
    }
    
    return { channels: data || [] };
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
  recipientType: 'employee' | 'channel',
  recipients: string[],
  message: string,
  workspaceId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-slack-message', {
      body: {
        recipient_type: recipientType,
        recipients,
        message,
        workspace_id: workspaceId
      },
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
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
  template: Omit<SlackMessageTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; template?: SlackMessageTemplate; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('slack_message_templates')
      .insert([template])
      .select();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, template: data[0] };
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
export const fetchMessageTemplates = async (): Promise<{ 
  templates: SlackMessageTemplate[]; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase
      .from('slack_message_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return { templates: [], error: error.message };
    }
    
    return { templates: data || [] };
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
      .from('slack_employees')
      .select('slack_connected')
      .eq('employee_id', employeeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return { connected: false };
      }
      return { connected: false, error: error.message };
    }
    
    return { connected: data?.slack_connected || false };
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
  employees: (Partial<SlackEmployee> & { id: string; first_name: string; last_name: string; email: string; role: string })[];
  error?: string;
}> => {
  try {
    // Fetch employees
    const { data: employeesData, error: employeesError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, role');
    
    if (employeesError) {
      return { employees: [], error: employeesError.message };
    }
    
    // Fetch Slack employee mapping
    const { data: slackEmployeeData, error: slackError } = await supabase
      .from('slack_employees')
      .select('*');
    
    if (slackError) {
      return { employees: [], error: slackError.message };
    }
    
    // Combine the data
    const combinedData = employeesData.map(employee => {
      const slackData = slackEmployeeData.find(se => se.employee_id === employee.id);
      return {
        ...employee,
        ...(slackData || {}),
        slack_connected: !!slackData?.slack_connected,
      };
    });
    
    return { employees: combinedData };
  } catch (err) {
    console.error('Error fetching employees with Slack status:', err);
    return { 
      employees: [], 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};
