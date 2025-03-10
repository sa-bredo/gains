
import { supabase } from '@/integrations/supabase/client';
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowAssignmentWithFlow, 
  PageFlowStatus,
  PageAction,
  PageAutomation
} from '../types';

// Type helper for database to application model conversions
type DbPage = Omit<Page, 'actions' | 'automation_config'> & {
  actions: any;
  automation_config: any;
};

type DbPageFlow = Omit<PageFlow, 'pages'> & {
  pages?: DbPage[];
};

// Helper function to convert database page to application page
const convertDbPageToPage = (dbPage: DbPage): Page => {
  return {
    ...dbPage,
    actions: dbPage.actions ? (dbPage.actions as PageAction[]) : undefined,
    automation_config: dbPage.automation_config ? (dbPage.automation_config as PageAutomation) : undefined
  };
};

// Helper function to convert application page to database page
const convertPageToDbPage = (page: Partial<Page>): Partial<DbPage> => {
  return {
    ...page,
    actions: page.actions ? page.actions : undefined,
    automation_config: page.automation_config ? page.automation_config : undefined
  };
};

// Get all page flows
export const getPageFlows = async (companyId: string): Promise<PageFlow[]> => {
  try {
    const { data, error } = await supabase
      .from('page_flows')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data as PageFlow[];
  } catch (error) {
    console.error('Error getting page flows:', error);
    return [];
  }
};

// Interface needed for the PageFlowWithPages type
interface PageFlowWithPages extends PageFlow {
  pages: Page[];
}

// Get a single page flow by ID with its pages
export const getPageFlowWithPages = async (id: string): Promise<PageFlowWithPages | null> => {
  try {
    // First get the flow
    const { data: flow, error: flowError } = await supabase
      .from('page_flows')
      .select('*')
      .eq('id', id)
      .single();
      
    if (flowError) throw flowError;
    
    // Then get the pages for this flow
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('flow_id', id)
      .order('order_index', { ascending: true });
      
    if (pagesError) throw pagesError;
    
    // Convert database pages to application pages
    const convertedPages = pages ? pages.map((page) => convertDbPageToPage(page as DbPage)) : [];
    
    // Combine the flow and pages
    return {
      ...flow as PageFlow,
      pages: convertedPages
    };
  } catch (error) {
    console.error(`Error getting page flow with ID ${id}:`, error);
    return null;
  }
};

// Create a new page flow
export const createFlow = async (flowData: Partial<PageFlow>): Promise<PageFlow> => {
  try {
    // Make sure title is not undefined
    if (!flowData.title) {
      throw new Error('Flow title is required');
    }
    
    const { data, error } = await supabase
      .from('page_flows')
      .insert({
        title: flowData.title,
        description: flowData.description,
        company_id: flowData.company_id,
        created_by: flowData.created_by,
        data_binding_type: flowData.data_binding_type,
        data_binding_id: flowData.data_binding_id,
        is_active: flowData.is_active !== undefined ? flowData.is_active : true
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data as PageFlow;
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
    const { data, error } = await supabase
      .from('page_flows')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as PageFlow;
  } catch (error) {
    console.error(`Error updating page flow with ID ${id}:`, error);
    throw error;
  }
};

// Delete a page flow
export const deletePageFlow = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('page_flows')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting page flow with ID ${id}:`, error);
    throw error;
  }
};

// Add a page to a flow
export const addPage = async (pageData: Partial<Page>): Promise<Page> => {
  try {
    // Convert Page to DbPage for database storage
    const dbPageData = convertPageToDbPage(pageData);
    
    // Ensure required fields are present
    if (!dbPageData.flow_id) {
      throw new Error('flow_id is required');
    }
    if (!dbPageData.title) {
      throw new Error('title is required');
    }
    if (!dbPageData.page_type) {
      throw new Error('page_type is required');
    }
    if (dbPageData.order_index === undefined) {
      throw new Error('order_index is required');
    }
    
    const { data, error } = await supabase
      .from('pages')
      .insert({
        flow_id: dbPageData.flow_id,
        title: dbPageData.title,
        description: dbPageData.description,
        page_type: dbPageData.page_type,
        content: dbPageData.content,
        actions: dbPageData.actions,
        automation_config: dbPageData.automation_config,
        document_id: dbPageData.document_id,
        order_index: dbPageData.order_index
      })
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert database page to application page
    return convertDbPageToPage(data as DbPage);
  } catch (error) {
    console.error('Error adding page:', error);
    throw error;
  }
};

// Update a page
export const updatePageInfo = async (id: string, updateData: Partial<Page>): Promise<Page> => {
  try {
    // Convert Page to DbPage for database storage
    const dbPageData = convertPageToDbPage(updateData);
    
    const { data, error } = await supabase
      .from('pages')
      .update(dbPageData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Convert database page to application page
    return convertDbPageToPage(data as DbPage);
  } catch (error) {
    console.error(`Error updating page with ID ${id}:`, error);
    throw error;
  }
};

// Delete a page
export const deletePage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error deleting page with ID ${id}:`, error);
    throw error;
  }
};

// Reorder pages
export const updatePagesOrder = async (pages: Array<{ id: string, order_index: number }>): Promise<boolean> => {
  try {
    // Use a transaction to update all pages at once
    for (const page of pages) {
      const { error } = await supabase
        .from('pages')
        .update({ order_index: page.order_index })
        .eq('id', page.id);
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error reordering pages:', error);
    throw error;
  }
};

// Assign a flow to a user
export const assignFlowToUser = async (flowId: string, userId: string): Promise<PageFlowAssignment> => {
  try {
    const { data, error } = await supabase
      .from('flow_assignments')
      .insert({
        flow_id: flowId,
        assigned_to: userId,
        status: 'not_started',
        current_page_index: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data as PageFlowAssignment;
  } catch (error) {
    console.error('Error assigning flow:', error);
    throw error;
  }
};

// Get assignments for a user
export const getUserAssignments = async (userId: string): Promise<PageFlowAssignmentWithFlow[]> => {
  try {
    // Get assignments for this user
    const { data: assignments, error: assignmentsError } = await supabase
      .from('flow_assignments')
      .select('*')
      .eq('assigned_to', userId);
      
    if (assignmentsError) throw assignmentsError;
    
    // Get flows and pages for these assignments
    const result: PageFlowAssignmentWithFlow[] = [];
    
    for (const assignment of assignments) {
      const flow = await getPageFlowWithPages(assignment.flow_id);
      
      if (flow) {
        // Get progress for this assignment
        const { data: progress, error: progressError } = await supabase
          .from('flow_progress')
          .select('*')
          .eq('assignment_id', assignment.id);
          
        if (progressError) throw progressError;
        
        result.push({
          ...assignment as PageFlowAssignment,
          flow: flow,
          progress: progress as PageFlowProgress[]
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error getting assignments for user ${userId}:`, error);
    return [];
  }
};
