
import { Field } from './components/PDFEditor';

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
