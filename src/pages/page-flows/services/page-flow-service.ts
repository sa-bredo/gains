
import { supabase } from '@/integrations/supabase/client';
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowAssignmentWithFlow, 
  PageFlowStatus 
} from '../types';

// Helper function to mock database data without reaching out to the DB
const mockDataResponse = <T>(data: T) => {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK'
  };
};

// Get all page flows
export const getPageFlows = async (companyId: string): Promise<PageFlow[]> => {
  try {
    // Since the tables don't exist yet, return mock data
    const mockFlows: PageFlow[] = [
      {
        id: '1',
        company_id: companyId || '1',
        title: 'Employee Onboarding',
        description: 'Step by step process for onboarding new employees',
        data_binding_type: 'employee',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user-1',
        is_active: true
      },
      {
        id: '2',
        company_id: companyId || '1',
        title: 'Equipment Checkout',
        description: 'Process for checking out company equipment',
        data_binding_type: 'asset',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'user-1',
        is_active: true
      }
    ];
    
    return mockFlows;
  } catch (error) {
    console.error('Error getting page flows:', error);
    return [];
  }
};

// Get a single page flow by ID with its pages
export const getPageFlowWithPages = async (id: string): Promise<PageFlowWithPages | null> => {
  try {
    // Mock data for a flow with pages
    const mockPages: Page[] = [
      {
        id: 'page-1',
        flow_id: id,
        title: 'Welcome',
        description: 'Welcome to the onboarding process',
        page_type: 'content',
        content: '<p>Welcome to the company! This guide will help you get started.</p>',
        order_index: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'page-2',
        flow_id: id,
        title: 'Setup Your Account',
        description: 'Steps to setup your account',
        page_type: 'action',
        content: '<p>Please follow these steps to set up your account.</p>',
        order_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    const mockFlow: PageFlowWithPages = {
      id: id,
      company_id: '1',
      title: 'Employee Onboarding',
      description: 'Step by step process for onboarding new employees',
      data_binding_type: 'employee',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1',
      is_active: true,
      pages: mockPages
    };
    
    return mockFlow;
  } catch (error) {
    console.error(`Error getting page flow with ID ${id}:`, error);
    return null;
  }
};

// Create a new page flow
export const createFlow = async (flowData: Partial<PageFlow>): Promise<PageFlow> => {
  try {
    // Mock creation of a flow
    const newFlow: PageFlow = {
      id: `flow-${Date.now()}`,
      company_id: flowData.company_id || '1',
      title: flowData.title || 'New Flow',
      description: flowData.description || '',
      data_binding_type: flowData.data_binding_type || null,
      data_binding_id: flowData.data_binding_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: flowData.created_by || 'user-1',
      is_active: flowData.is_active ?? true
    };
    
    return newFlow;
  } catch (error) {
    console.error('Error creating page flow:', error);
    throw error;
  }
};

// Alias for createFlow to match imports
export const createPageFlow = createFlow;

// Update an existing page flow
export const updateFlow = async (id: string, updateData: Partial<PageFlow>): Promise<PageFlow> => {
  try {
    // Mock update of a flow
    const updatedFlow: PageFlow = {
      id: id,
      company_id: '1',
      title: updateData.title || 'Updated Flow',
      description: updateData.description || '',
      data_binding_type: updateData.data_binding_type || null,
      data_binding_id: updateData.data_binding_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'user-1',
      is_active: updateData.is_active ?? true
    };
    
    return updatedFlow;
  } catch (error) {
    console.error(`Error updating page flow with ID ${id}:`, error);
    throw error;
  }
};

// Delete a page flow
export const deletePageFlow = async (id: string): Promise<boolean> => {
  try {
    // Mock deletion
    console.log(`Deleting page flow with ID ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting page flow with ID ${id}:`, error);
    throw error;
  }
};

// Add a page to a flow
export const addPage = async (pageData: Partial<Page>): Promise<Page> => {
  try {
    // Mock page creation
    const newPage: Page = {
      id: `page-${Date.now()}`,
      flow_id: pageData.flow_id || '1',
      title: pageData.title || 'New Page',
      description: pageData.description || '',
      page_type: pageData.page_type || 'content',
      content: pageData.content || '',
      actions: pageData.actions || [],
      automation_config: pageData.automation_config || undefined,
      document_id: pageData.document_id || undefined,
      order_index: pageData.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newPage;
  } catch (error) {
    console.error('Error adding page:', error);
    throw error;
  }
};

// Update a page
export const updatePageInfo = async (id: string, updateData: Partial<Page>): Promise<Page> => {
  try {
    // Mock page update
    const updatedPage: Page = {
      id: id,
      flow_id: '1',
      title: updateData.title || 'Updated Page',
      description: updateData.description || '',
      page_type: updateData.page_type || 'content',
      content: updateData.content || '',
      actions: updateData.actions || [],
      automation_config: updateData.automation_config || undefined,
      document_id: updateData.document_id || undefined,
      order_index: updateData.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return updatedPage;
  } catch (error) {
    console.error(`Error updating page with ID ${id}:`, error);
    throw error;
  }
};

// Delete a page
export const deletePage = async (id: string): Promise<boolean> => {
  try {
    // Mock page deletion
    console.log(`Deleting page with ID ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting page with ID ${id}:`, error);
    throw error;
  }
};

// Reorder pages
export const updatePagesOrder = async (pages: Array<{ id: string, order_index: number }>): Promise<boolean> => {
  try {
    // Mock reordering
    pages.forEach((page) => {
      console.log(`Updating page ${page.id} to order ${page.order_index}`);
    });
    
    return true;
  } catch (error) {
    console.error('Error reordering pages:', error);
    throw error;
  }
};

// Assign a flow to a user
export const assignFlowToUser = async (flowId: string, userId: string): Promise<PageFlowAssignment> => {
  try {
    // Mock assignment creation
    const newAssignment: PageFlowAssignment = {
      id: `assignment-${Date.now()}`,
      flow_id: flowId,
      assigned_to: userId,
      status: 'not_started',
      current_page_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newAssignment;
  } catch (error) {
    console.error('Error assigning flow:', error);
    throw error;
  }
};

// Interface needed for the PageFlowWithPages type
interface PageFlowWithPages extends PageFlow {
  pages: Page[];
}

// Get assignments for a user
export const getUserAssignments = async (userId: string): Promise<PageFlowAssignmentWithFlow[]> => {
  try {
    // Mock assignments with flows
    const mockAssignments: PageFlowAssignmentWithFlow[] = [
      {
        id: 'assignment-1',
        flow_id: '1',
        assigned_to: userId,
        status: 'in_progress',
        current_page_index: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        flow: {
          id: '1',
          company_id: '1',
          title: 'Employee Onboarding',
          description: 'Step by step process for onboarding new employees',
          data_binding_type: 'employee',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'user-1',
          is_active: true,
          pages: [
            {
              id: 'page-1',
              flow_id: '1',
              title: 'Welcome',
              description: 'Welcome to the onboarding process',
              page_type: 'content',
              content: '<p>Welcome to the company! This guide will help you get started.</p>',
              order_index: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'page-2',
              flow_id: '1',
              title: 'Setup Your Account',
              description: 'Steps to setup your account',
              page_type: 'action',
              content: '<p>Please follow these steps to set up your account.</p>',
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        },
        progress: [
          {
            id: 'progress-1',
            assignment_id: 'assignment-1',
            page_id: 'page-1',
            status: 'completed',
            input_data: null,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      }
    ];
    
    return mockAssignments;
  } catch (error) {
    console.error(`Error getting assignments for user ${userId}:`, error);
    return [];
  }
};
