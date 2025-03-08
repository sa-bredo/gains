
export interface SlackConfig {
  id: string;
  company_id: string;
  slack_workspace_id: string;
  slack_bot_token: string;
  slack_signing_secret: string;
  slack_app_id: string;
  slack_workspace_name: string;
  slack_team_url: string;
  connected_at: string;
  updated_at?: string;
  created_at?: string;
}

export interface SlackEmployee {
  employee_id: string;
  slack_user_id: string;
  slack_username: string;
  slack_email: string;
  slack_connected: boolean;
  slack_connected_at: string;
}

export interface SlackMessageTemplate {
  id: string;
  name: string;
  content: string;
  category: 'Scheduling' | 'HR' | 'General';
  created_at?: string;
  updated_at?: string;
}

export interface SlackMessage {
  id: string;
  recipient_id: string; // Can be employee_id or channel_id
  recipient_type: 'employee' | 'channel';
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  sent_by: string;
  sent_at?: string;
  created_at?: string;
}

export interface SlackChannelInfo {
  id: string;
  name: string;
  is_private: boolean;
  member_count: number;
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}
