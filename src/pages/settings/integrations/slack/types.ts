
import * as z from 'zod';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'slack' | 'email' | 'sms';
  category: string;
  created_at?: string;
  updated_at?: string;
}

export const messageTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  content: z.string().min(1, 'Template content is required'),
  type: z.enum(['slack', 'email', 'sms']),
  category: z.string().min(1, 'Category is required'),
});

export type MessageTemplateFormValues = z.infer<typeof messageTemplateSchema>;

export const messageCategories = [
  { value: 'welcome', label: 'Welcome Messages' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'reminder', label: 'Reminders' },
  { value: 'feedback', label: 'Feedback Requests' },
  { value: 'general', label: 'General Communication' },
];

// Updated SlackConfig interface with the required properties
export interface SlackConfig {
  id?: string;
  company_id?: string;
  bot_token?: string;
  team_id?: string;
  team_name?: string;
  access_token?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  created_at?: string;
  updated_at?: string;
  type?: string;
}

// Updated SlackEmployeeIntegration with employee name and email
export interface SlackEmployeeIntegration {
  id?: string;
  employee_id: string;
  employee_name?: string;
  employee_email?: string;
  slack_user_id?: string;
  slack_channel_id?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'connected' | 'pending' | 'failed';
  error_message?: string;
}

// Define a type to match the database structure for message_templates
export interface MessageTemplateDB {
  id: string;
  name: string;
  content: string;
  type: string;
  category: string;
  created_at: string;
  updated_at: string;
}
