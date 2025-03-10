
import { supabase } from '@/integrations/supabase/client';
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowAssignmentWithFlow, 
  PageFlowStatus 
} from '../types';

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
    
    // Combine the flow and pages
    return {
      ...flow as PageFlow,
      pages: pages as Page[]
    };
  } catch (error) {
    console.error(`Error getting page flow with ID ${id}:`, error);
    return null;
  }
};

// Create a new page flow
export const createFlow = async (flowData: Partial<PageFlow>): Promise<PageFlow> => {
  try {
    const { data, error } = await supabase
      .from('page_flows')
      .insert(flowData)
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
    const { data, error } = await supabase
      .from('pages')
      .insert(pageData)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Page;
  } catch (error) {
    console.error('Error adding page:', error);
    throw error;
  }
};

// Update a page
export const updatePageInfo = async (id: string, updateData: Partial<Page>): Promise<Page> => {
  try {
    const { data, error } = await supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data as Page;
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
