
import { supabase } from "@/integrations/supabase/client";
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowWithPages,
  PageFlowAssignmentWithFlow
} from "../types";

// Mock implementation of service functions that will work properly once the database tables are created
// Currently, these functions return mocked data or empty arrays to prevent type errors

// Fetch all page flows for the current company
export const fetchPageFlows = async (companyId: string): Promise<PageFlow[]> => {
  console.log('Attempting to fetch page flows for company:', companyId);
  
  // Return empty array until the tables are created
  return [];
};

// Fetch a specific page flow with its pages
export const fetchPageFlowWithPages = async (flowId: string): Promise<PageFlowWithPages | null> => {
  console.log('Attempting to fetch page flow with ID:', flowId);
  
  // Return null until the tables are created
  return null;
};

// Create a new page flow
export const createPageFlow = async (
  pageFlow: Partial<PageFlow>,
  companyId: string
): Promise<PageFlow> => {
  console.log('Attempting to create new page flow:', { pageFlow, companyId });
  
  // Mock a response until the tables are created
  return {
    id: 'mock-id',
    company_id: companyId,
    title: pageFlow.title || 'New Flow',
    description: pageFlow.description,
    data_binding_type: pageFlow.data_binding_type,
    data_binding_id: pageFlow.data_binding_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'mock-user',
    is_active: true
  };
};

// Update an existing page flow
export const updatePageFlow = async (
  flowId: string,
  pageFlow: Partial<PageFlow>
): Promise<PageFlow> => {
  console.log('Attempting to update page flow:', { flowId, pageFlow });
  
  // Mock a response until the tables are created
  return {
    id: flowId,
    company_id: 'mock-company',
    title: pageFlow.title || 'Updated Flow',
    description: pageFlow.description,
    data_binding_type: pageFlow.data_binding_type,
    data_binding_id: pageFlow.data_binding_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'mock-user',
    is_active: true
  };
};

// Delete a page flow
export const deletePageFlow = async (flowId: string): Promise<void> => {
  console.log('Attempting to delete page flow:', flowId);
  
  // No-op until the tables are created
  return;
};

// Create a new page in a flow
export const createPage = async (page: Partial<Page>): Promise<Page> => {
  console.log('Attempting to create new page:', page);
  
  // Mock a response until the tables are created
  return {
    id: 'mock-page-id',
    flow_id: page.flow_id || 'mock-flow-id',
    title: page.title || 'New Page',
    description: page.description,
    page_type: page.page_type || 'content',
    content: page.content,
    actions: page.actions,
    automation_config: page.automation_config,
    document_id: page.document_id,
    order_index: page.order_index || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Update an existing page
export const updatePage = async (
  pageId: string,
  page: Partial<Page>
): Promise<Page> => {
  console.log('Attempting to update page:', { pageId, page });
  
  // Mock a response until the tables are created
  return {
    id: pageId,
    flow_id: page.flow_id || 'mock-flow-id',
    title: page.title || 'Updated Page',
    description: page.description,
    page_type: page.page_type || 'content',
    content: page.content,
    actions: page.actions,
    automation_config: page.automation_config,
    document_id: page.document_id,
    order_index: page.order_index || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Delete a page
export const deletePage = async (pageId: string): Promise<void> => {
  console.log('Attempting to delete page:', pageId);
  
  // No-op until the tables are created
  return;
};

// Reorder pages in a flow
export const reorderPages = async (
  flowId: string,
  pageIds: string[]
): Promise<void> => {
  console.log('Attempting to reorder pages:', { flowId, pageIds });
  
  // No-op until the tables are created
  return;
};

// Assign a page flow to a user
export const assignPageFlow = async (
  flowId: string,
  userId: string
): Promise<PageFlowAssignment> => {
  console.log('Attempting to assign page flow:', { flowId, userId });
  
  // Mock a response until the tables are created
  return {
    id: 'mock-assignment-id',
    flow_id: flowId,
    assigned_to: userId,
    status: 'not_started',
    current_page_index: 0,
    completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Update assignment status
export const updateAssignment = async (
  assignmentId: string,
  updates: Partial<PageFlowAssignment>
): Promise<PageFlowAssignment> => {
  console.log('Attempting to update assignment:', { assignmentId, updates });
  
  // Mock a response until the tables are created
  return {
    id: assignmentId,
    flow_id: updates.flow_id || 'mock-flow-id',
    assigned_to: updates.assigned_to || 'mock-user',
    status: updates.status || 'in_progress',
    current_page_index: updates.current_page_index !== undefined ? updates.current_page_index : 0,
    completed_at: updates.completed_at,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Record progress on a page
export const recordPageProgress = async (
  assignmentId: string,
  pageId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  inputData?: Record<string, any>
): Promise<PageFlowProgress> => {
  console.log('Attempting to record page progress:', { 
    assignmentId, pageId, status, inputData 
  });
  
  // Mock a response until the tables are created
  return {
    id: 'mock-progress-id',
    assignment_id: assignmentId,
    page_id: pageId,
    status: status,
    input_data: inputData,
    completed_at: status === 'completed' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Fetch assignments for a user
export const fetchUserAssignments = async (userId: string): Promise<PageFlowAssignmentWithFlow[]> => {
  console.log('Attempting to fetch user assignments:', userId);
  
  // Return empty array until the tables are created
  return [];
};

// Duplicate a page flow
export const duplicatePageFlow = async (
  flowId: string,
  newTitle: string,
  companyId: string
): Promise<PageFlowWithPages> => {
  console.log('Attempting to duplicate page flow:', { flowId, newTitle, companyId });
  
  // Mock a response until the tables are created
  return {
    id: 'mock-duplicate-id',
    company_id: companyId,
    title: newTitle,
    description: '',
    data_binding_type: null,
    data_binding_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'mock-user',
    is_active: true,
    pages: []
  };
};
