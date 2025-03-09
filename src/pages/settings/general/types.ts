
import * as z from 'zod';

export interface GeneralSettingField {
  name: string;
  display_name: string;
  type: 'text' | 'select' | 'number';
  value: string;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface GeneralSettingsConfig {
  id: string;
  key: string;
  value: string;
  company_id: string;
  created_at?: string;
  updated_at?: string;
}

export const generalSettingFormSchema = z.object({
  value: z.string().min(1, 'Value is required'),
});

export type GeneralSettingFormValues = z.infer<typeof generalSettingFormSchema>;
