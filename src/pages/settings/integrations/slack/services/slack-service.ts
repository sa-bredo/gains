
import { supabase } from '@/integrations/supabase/client';
import { MessageTemplate, SlackConfig, SlackEmployeeIntegration } from '../types';
import { toast } from 'sonner';

export const getSlackConfig = async (companyId: string): Promise<SlackConfig | null> => {
  try {
    // Get workspace ID from config
    const { data: workspaceIdData, error: workspaceIdError } = await supabase
      .from('config')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'slack_workspace_id')
      .single();
    
    if (workspaceIdError || !workspaceIdData) {
      return null;
    }
    
    // Fetch all related Slack configs
    const slackConfigKeys = [
      'slack_workspace_id',
      'slack_bot_token',
      'slack_signing_secret',
      'slack_app_id',
      'slack_workspace_name',
      'slack_team_url',
      'slack_connected_at'
    ];
    
    const { data: configData, error: configError } = await supabase
      .from('config')
      .select('*')
      .eq('company_id', companyId)
      .in('key', slackConfigKeys);
    
    if (configError || !configData || configData.length === 0) {
      return null;
    }
    
    // Transform the config rows into a SlackConfig object
    const slackConfig: SlackConfig = {
      company_id: companyId,
      slack_workspace_id: configData.find(item => item.key === 'slack_workspace_id')?.value || '',
      slack_bot_token: configData.find(item => item.key === 'slack_bot_token')?.value || '',
      slack_signing_secret: configData.find(item => item.key === 'slack_signing_secret')?.value || '',
      slack_app_id: configData.find(item => item.key === 'slack_app_id')?.value || '',
      slack_workspace_name: configData.find(item => item.key === 'slack_workspace_name')?.value || '',
      slack_team_url: configData.find(item => item.key === 'slack_team_url')?.value || '',
      connected_at: configData.find(item => item.key === 'slack_connected_at')?.value || new Date().toISOString(),
    };
    
    return slackConfig;
  } catch (error) {
    console.error('Error fetching Slack config:', error);
    return null;
  }
};

export const disconnectSlack = async (companyId: string): Promise<boolean> => {
  try {
    // Get all config keys for Slack
    const slackConfigKeys = [
      'slack_workspace_id',
      'slack_bot_token',
      'slack_signing_secret',
      'slack_app_id',
      'slack_workspace_name',
      'slack_team_url',
      'slack_connected_at'
    ];
    
    // Delete all Slack config entries
    const { error } = await supabase
      .from('config')
      .delete()
      .eq('company_id', companyId)
      .in('key', slackConfigKeys);
    
    if (error) {
      console.error('Error disconnecting Slack:', error);
      return false;
    }
    
    // Update all employees to remove Slack integration data
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, integrations');
      
    if (empError) {
      console.error('Error fetching employees:', empError);
      return true; // Config deleted successfully, so return true even if employees update failed
    }
    
    for (const employee of employees) {
      if (employee.integrations && typeof employee.integrations === 'object' && employee.integrations.slack) {
        const updatedIntegrations = { ...employee.integrations };
        delete updatedIntegrations.slack;
        
        const { error: updateError } = await supabase
          .from('employees')
          .update({ integrations: updatedIntegrations })
          .eq('id', employee.id);
          
        if (updateError) {
          console.error(`Error updating employee ${employee.id}:`, updateError);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error disconnecting Slack:', error);
    return false;
  }
};

export const getMessageTemplates = async (): Promise<MessageTemplate[]> => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('type', 'slack');
    
    if (error) {
      console.error('Error fetching message templates:', error);
      return [];
    }
    
    return (data || []) as MessageTemplate[];
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return [];
  }
};

export const createMessageTemplate = async (template: Partial<MessageTemplate>): Promise<MessageTemplate | null> => {
  try {
    // Ensure required fields
    const completeTemplate = {
      type: 'slack' as const,
      name: template.name || '',
      content: template.content || '',
      category: template.category || 'General' as const
    };

    const { data, error } = await supabase
      .from('message_templates')
      .insert([completeTemplate])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating message template:', error);
      return null;
    }
    
    return data as MessageTemplate;
  } catch (error) {
    console.error('Error creating message template:', error);
    return null;
  }
};

export const updateMessageTemplate = async (template: Partial<MessageTemplate>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('message_templates')
      .update(template)
      .eq('id', template.id as string);
    
    if (error) {
      console.error('Error updating message template:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating message template:', error);
    return false;
  }
};

export const deleteMessageTemplate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting message template:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting message template:', error);
    return false;
  }
};

// Get all employees with their Slack integration info
export const getSlackEmployees = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, integrations');
    
    if (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
    
    return data.map(employee => {
      const slackInfo = employee.integrations && typeof employee.integrations === 'object' ? employee.integrations.slack : null;
      
      return {
        id: employee.id,
        employee_id: employee.id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        slack_user_id: slackInfo?.slack_user_id || null,
        slack_username: slackInfo?.slack_username || null,
        slack_email: slackInfo?.slack_email || null,
        slack_connected: !!slackInfo?.slack_connected,
        slack_connected_at: slackInfo?.slack_connected_at || null,
      };
    });
  } catch (error) {
    console.error('Error fetching Slack employees:', error);
    return [];
  }
};

// Connect employee to Slack manually
export const connectEmployeeToSlack = async (
  employeeId: string, 
  workspaceId: string
): Promise<{ success: boolean; message: string; user?: any }> => {
  try {
    const response = await fetch('/api/connect-slack-employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: employeeId,
        workspace_id: workspaceId,
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to connect employee to Slack');
    }
    
    return {
      success: true,
      message: 'Successfully connected to Slack',
      user: result.user
    };
  } catch (error) {
    console.error('Error connecting employee to Slack:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Disconnect an employee from Slack
export const disconnectEmployeeFromSlack = async (employeeId: string): Promise<boolean> => {
  try {
    // First, get the employee to check if they're connected
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('integrations')
      .eq('id', employeeId)
      .single();
    
    if (empError || !employee) {
      console.error('Error finding employee:', empError);
      return false;
    }
    
    if (!employee.integrations || typeof employee.integrations !== 'object' || !employee.integrations.slack) {
      // Employee isn't connected to Slack
      return true;
    }
    
    // Remove the Slack integration data
    const updatedIntegrations = { ...employee.integrations };
    delete updatedIntegrations.slack;
    
    const { error } = await supabase
      .from('employees')
      .update({ integrations: updatedIntegrations })
      .eq('id', employeeId);
    
    if (error) {
      console.error('Error disconnecting employee from Slack:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error disconnecting employee from Slack:', error);
    return false;
  }
};

// Send Slack message
export const sendSlackMessage = async (
  recipients: string[],
  recipientType: 'employee' | 'channel' | 'group', 
  message: string,
  workspaceId: string,
  userId: string
): Promise<{ success: boolean; results?: any[] }> => {
  try {
    const response = await fetch('/api/send-slack-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients,
        recipient_type: recipientType,
        message,
        workspace_id: workspaceId,
        user_id: userId
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to send Slack message');
    }
    
    return {
      success: true,
      results: result.results
    };
  } catch (error) {
    console.error('Error sending Slack message:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to send message');
    return {
      success: false
    };
  }
};
