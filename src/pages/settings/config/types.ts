
import * as z from 'zod';

export interface ConfigItem {
  id: string;
  key: string;
  display_name: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export const configFormSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  display_name: z.string().min(1, 'Display name is required'),
  value: z.string().min(1, 'Value is required'),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;
