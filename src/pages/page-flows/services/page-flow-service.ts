
import { supabase } from "@/integrations/supabase/client";
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowWithPages,
  PageFlowAssignmentWithFlow
} from "../types";
import { useCompany } from "@/contexts/CompanyContext";

// Fetch all page flows for the current company
export const fetchPageFlows = async (companyId: string): Promise<PageFlow[]> => {
  const { data, error } = await supabase
    .from('page_flows')
    .select('*')
    .eq('company_id', companyId)
    .order('title');

  if (error) {
    console.error('Error fetching page flows:', error);
    throw new Error(`Failed to fetch page flows: ${error.message}`);
  }

  return data || [];
};

// Fetch a specific page flow with its pages
export const fetchPageFlowWithPages = async (flowId: string): Promise<PageFlowWithPages | null> => {
  // Fetch the flow
  const { data: flow, error: flowError } = await supabase
    .from('page_flows')
    .select('*')
    .eq('id', flowId)
    .single();

  if (flowError) {
    console.error('Error fetching page flow:', flowError);
    throw new Error(`Failed to fetch page flow: ${flowError.message}`);
  }

  if (!flow) return null;

  // Fetch the pages for the flow
  const { data: pages, error: pagesError } = await supabase
    .from('pages')
    .select('*')
    .eq('flow_id', flowId)
    .order('order_index');

  if (pagesError) {
    console.error('Error fetching pages:', pagesError);
    throw new Error(`Failed to fetch pages: ${pagesError.message}`);
  }

  return {
    ...flow,
    pages: pages || []
  };
};

// Create a new page flow
export const createPageFlow = async (
  pageFlow: Partial<PageFlow>,
  companyId: string
): Promise<PageFlow> => {
  const { data, error } = await supabase
    .from('page_flows')
    .insert([{
      ...pageFlow,
      company_id: companyId,
      created_by: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating page flow:', error);
    throw new Error(`Failed to create page flow: ${error.message}`);
  }

  return data;
};

// Update an existing page flow
export const updatePageFlow = async (
  flowId: string,
  pageFlow: Partial<PageFlow>
): Promise<PageFlow> => {
  const { data, error } = await supabase
    .from('page_flows')
    .update(pageFlow)
    .eq('id', flowId)
    .select()
    .single();

  if (error) {
    console.error('Error updating page flow:', error);
    throw new Error(`Failed to update page flow: ${error.message}`);
  }

  return data;
};

// Delete a page flow
export const deletePageFlow = async (flowId: string): Promise<void> => {
  const { error } = await supabase
    .from('page_flows')
    .delete()
    .eq('id', flowId);

  if (error) {
    console.error('Error deleting page flow:', error);
    throw new Error(`Failed to delete page flow: ${error.message}`);
  }
};

// Create a new page in a flow
export const createPage = async (page: Partial<Page>): Promise<Page> => {
  const { data, error } = await supabase
    .from('pages')
    .insert([page])
    .select()
    .single();

  if (error) {
    console.error('Error creating page:', error);
    throw new Error(`Failed to create page: ${error.message}`);
  }

  return data;
};

// Update an existing page
export const updatePage = async (
  pageId: string,
  page: Partial<Page>
): Promise<Page> => {
  const { data, error } = await supabase
    .from('pages')
    .update(page)
    .eq('id', pageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating page:', error);
    throw new Error(`Failed to update page: ${error.message}`);
  }

  return data;
};

// Delete a page
export const deletePage = async (pageId: string): Promise<void> => {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    console.error('Error deleting page:', error);
    throw new Error(`Failed to delete page: ${error.message}`);
  }
};

// Reorder pages in a flow
export const reorderPages = async (
  flowId: string,
  pageIds: string[]
): Promise<void> => {
  // Start a transaction to update all page orders
  const updates = pageIds.map((pageId, index) => {
    return supabase
      .from('pages')
      .update({ order_index: index })
      .eq('id', pageId);
  });

  // Execute all updates
  await Promise.all(updates);
};

// Assign a page flow to a user
export const assignPageFlow = async (
  flowId: string,
  userId: string
): Promise<PageFlowAssignment> => {
  const { data, error } = await supabase
    .from('page_flow_assignments')
    .insert([{
      flow_id: flowId,
      assigned_to: userId,
      status: 'not_started',
      current_page_index: 0
    }])
    .select()
    .single();

  if (error) {
    console.error('Error assigning page flow:', error);
    throw new Error(`Failed to assign page flow: ${error.message}`);
  }

  return data;
};

// Update assignment status
export const updateAssignment = async (
  assignmentId: string,
  updates: Partial<PageFlowAssignment>
): Promise<PageFlowAssignment> => {
  const { data, error } = await supabase
    .from('page_flow_assignments')
    .update(updates)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment:', error);
    throw new Error(`Failed to update assignment: ${error.message}`);
  }

  return data;
};

// Record progress on a page
export const recordPageProgress = async (
  assignmentId: string,
  pageId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  inputData?: Record<string, any>
): Promise<PageFlowProgress> => {
  // Check if progress record exists
  const { data: existingProgress } = await supabase
    .from('page_flow_progress')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('page_id', pageId)
    .single();

  let data;
  let error;

  if (existingProgress) {
    // Update existing progress
    const result = await supabase
      .from('page_flow_progress')
      .update({
        status,
        input_data: inputData,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', existingProgress.id)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  } else {
    // Create new progress record
    const result = await supabase
      .from('page_flow_progress')
      .insert([{
        assignment_id: assignmentId,
        page_id: pageId,
        status,
        input_data: inputData,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      }])
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Error recording page progress:', error);
    throw new Error(`Failed to record page progress: ${error.message}`);
  }

  return data;
};

// Fetch assignments for a user
export const fetchUserAssignments = async (userId: string): Promise<PageFlowAssignmentWithFlow[]> => {
  const { data, error } = await supabase
    .from('page_flow_assignments')
    .select(`
      *,
      flow:page_flows(
        *,
        pages:pages(*)
      )
    `)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user assignments:', error);
    throw new Error(`Failed to fetch user assignments: ${error.message}`);
  }

  // Fetch progress for each assignment
  const assignmentsWithProgress = await Promise.all(
    (data || []).map(async (assignment) => {
      const { data: progress } = await supabase
        .from('page_flow_progress')
        .select('*')
        .eq('assignment_id', assignment.id);
      
      return {
        ...assignment,
        progress: progress || []
      };
    })
  );

  return assignmentsWithProgress;
};

// Duplicate a page flow
export const duplicatePageFlow = async (
  flowId: string,
  newTitle: string,
  companyId: string
): Promise<PageFlowWithPages> => {
  // Fetch the original flow with pages
  const originalFlow = await fetchPageFlowWithPages(flowId);
  if (!originalFlow) {
    throw new Error('Original flow not found');
  }

  // Create a new flow
  const newFlow = await createPageFlow({
    title: newTitle,
    description: originalFlow.description,
    data_binding_type: originalFlow.data_binding_type,
    is_active: true
  }, companyId);

  // Create new pages for the flow
  await Promise.all(
    originalFlow.pages.map(async (page) => {
      await createPage({
        flow_id: newFlow.id,
        title: page.title,
        description: page.description,
        page_type: page.page_type,
        content: page.content,
        actions: page.actions,
        automation_config: page.automation_config,
        document_id: page.document_id,
        order_index: page.order_index
      });
    })
  );

  // Return the newly created flow with pages
  return await fetchPageFlowWithPages(newFlow.id) as PageFlowWithPages;
};
