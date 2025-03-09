
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
