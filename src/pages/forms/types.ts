
export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'multiple_choice'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'short_text';  // Added for backward compatibility

export type FormType = 'Join Team' | 'Survey';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];  // For multiple_choice fields
  description?: string;
}

export interface FormAppearance {
  backgroundOpacity?: number; // Between 0 and 100
  titleColor?: string;
  textColor?: string;
  backgroundColor?: string;  // New field for background color
}

export interface CompletionMessage {
  title: string;
  description: string;
}

export interface FormConfig {
  fields: FormField[];
  title: string;
  description?: string;
  coverImage?: string;
  appearance?: FormAppearance;
  completionMessage?: CompletionMessage;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  public_url: string;
  json_config: FormConfig;
  form_type?: FormType;
  archived?: boolean;
  submission_count?: number;
}

export interface TypedSubmissionValue {
  value: any;
  type: FieldType | string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_at: string;
  data: Record<string, string | TypedSubmissionValue>;
}
