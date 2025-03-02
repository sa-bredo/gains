
import { Field } from './components/PDFEditor';
import { Json } from '@/integrations/supabase/types';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  pdf_data: string;
  fields: Field[];
  created_at: string;
}

export interface DocumentInstance {
  id: string;
  template_id: string;
  name: string;
  status: 'draft' | 'sent' | 'signing' | 'completed';
  fields: Field[];
  created_at: string;
  updated_at: string;
}

// Database-specific types that match Supabase's structure
export interface DbDocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  pdf_data: string;
  fields: Json;
  created_at: string;
}

export interface DbDocumentInstance {
  id: string;
  template_id: string;
  name: string;
  status: string;
  fields: Json;
  created_at: string;
  updated_at: string;
}

// Helper functions for converting between types
export const convertDbTemplateToTemplate = (dbTemplate: DbDocumentTemplate): DocumentTemplate => {
  return {
    ...dbTemplate,
    fields: Array.isArray(dbTemplate.fields) ? dbTemplate.fields as unknown as Field[] : []
  };
};

export const convertDbInstanceToInstance = (dbInstance: DbDocumentInstance): DocumentInstance => {
  return {
    ...dbInstance,
    status: dbInstance.status as 'draft' | 'sent' | 'signing' | 'completed',
    fields: Array.isArray(dbInstance.fields) ? dbInstance.fields as unknown as Field[] : []
  };
};
