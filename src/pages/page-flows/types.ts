
export type PageType = 'content' | 'action' | 'automation' | 'document';

export type PageFlowStatus = 'not_started' | 'in_progress' | 'completed';

export interface PageAction {
  id: string;
  label: string;
  type: 'api' | 'slack' | 'email' | 'webhook';
  config: Record<string, any>;
}

export interface PageAutomation {
  id: string;
  type: 'email' | 'slack' | 'webhook';
  config: Record<string, any>;
}

export interface Page {
  id: string;
  flow_id: string;
  title: string;
  description?: string;
  page_type: PageType;
  content?: string;
  actions?: PageAction[];
  automation_config?: PageAutomation;
  document_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PageFlow {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  data_binding_type?: string;
  data_binding_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  pages?: Page[];
}

export interface PageFlowAssignment {
  id: string;
  flow_id: string;
  assigned_to: string;
  status: PageFlowStatus;
  current_page_index: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PageFlowProgress {
  id: string;
  assignment_id: string;
  page_id: string;
  status: PageFlowStatus;
  input_data?: Record<string, any>;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PageFlowWithPages extends PageFlow {
  pages: Page[];
}

export interface PageFlowAssignmentWithFlow extends PageFlowAssignment {
  flow: PageFlowWithPages;
  progress?: PageFlowProgress[];
}
