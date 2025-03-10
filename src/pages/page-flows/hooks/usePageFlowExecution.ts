import { useState, useEffect } from 'react';
import { 
  PageFlow, 
  Page, 
  PageFlowAssignment, 
  PageFlowProgress,
  PageFlowStatus
} from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/hooks/useAuth';

interface UsePageFlowExecutionProps {
  flowId?: string;
  assignmentId?: string;
}

export function usePageFlowExecution({ flowId, assignmentId }: UsePageFlowExecutionProps) {
  const [flow, setFlow] = useState<PageFlow | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [assignment, setAssignment] = useState<PageFlowAssignment | null>(null);
  const [progress, setProgress] = useState<PageFlowProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const { currentCompany } = useCompany();
  
  // Fix: Use safe property access with optional chaining for user ID
  const userId = currentUser?.id;

  useEffect(() => {
    if (!flowId && !assignmentId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // If we have an assignment ID, fetch the assignment first
        if (assignmentId) {
          const { data: assignmentData, error: assignmentError } = await supabase
            .from('page_flow_assignments')
            .select(`
              *,
              flow:page_flows(
                *,
                pages:pages(*)
              )
            `)
            .eq('id', assignmentId)
            // Fix: Use safe property access with optional chaining
            .eq('assigned_to', userId || '')
            .single();
            
          if (assignmentError) throw new Error(assignmentError.message);
          
          if (assignmentData) {
            setAssignment(assignmentData);
            setFlow(assignmentData.flow);
            setCurrentPageIndex(assignmentData.current_page_index || 0);
            
            // Get progress for this assignment
            const { data: progressData, error: progressError } = await supabase
              .from('page_flow_progress')
              .select('*')
              .eq('assignment_id', assignmentId);
              
            if (progressError) throw new Error(progressError.message);
            
            setProgress(progressData || []);
          }
        } 
        // Otherwise fetch the flow
        else if (flowId) {
          const { data: flowData, error: flowError } = await supabase
            .from('page_flows')
            .select(`
              *,
              pages(*)
            `)
            .eq('id', flowId)
            .single();
            
          if (flowError) throw new Error(flowError.message);
          
          if (flowData) {
            setFlow(flowData);
          }
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [flowId, assignmentId, userId]);
  
  // Update current page whenever flow or currentPageIndex changes
  useEffect(() => {
    if (flow?.pages && flow.pages.length > 0) {
      // Sort pages by order_index
      const sortedPages = [...flow.pages].sort((a, b) => a.order_index - b.order_index);
      
      if (currentPageIndex < sortedPages.length) {
        setCurrentPage(sortedPages[currentPageIndex]);
      } else {
        // Reset to first page if index is out of bounds
        setCurrentPageIndex(0);
        setCurrentPage(sortedPages[0]);
      }
    } else {
      setCurrentPage(null);
    }
  }, [flow, currentPageIndex]);
  
  const goToNextPage = async () => {
    if (!flow?.pages || !currentPage) return;
    
    const sortedPages = [...flow.pages].sort((a, b) => a.order_index - b.order_index);
    
    if (currentPageIndex < sortedPages.length - 1) {
      // If we have an assignment, update progress
      if (assignment) {
        // Mark current page as completed
        await recordProgress(currentPage.id, 'completed');
        
        // Update assignment with new page index
        const newPageIndex = currentPageIndex + 1;
        await supabase
          .from('page_flow_assignments')
          .update({ 
            current_page_index: newPageIndex,
            status: newPageIndex === sortedPages.length - 1 ? 'completed' : 'in_progress'
          })
          .eq('id', assignment.id);
          
        setCurrentPageIndex(newPageIndex);
      } else {
        setCurrentPageIndex(currentPageIndex + 1);
      }
    }
  };
  
  const goToPreviousPage = async () => {
    if (currentPageIndex > 0) {
      const newPageIndex = currentPageIndex - 1;
      
      // If we have an assignment, update it
      if (assignment) {
        await supabase
          .from('page_flow_assignments')
          .update({ 
            current_page_index: newPageIndex,
            status: 'in_progress'
          })
          .eq('id', assignment.id);
      }
      
      setCurrentPageIndex(newPageIndex);
    }
  };
  
  const recordProgress = async (
    pageId: string, 
    status: PageFlowStatus,
    inputData?: Record<string, any>
  ) => {
    if (!assignment) return;
    
    try {
      // Check if we already have progress for this page
      const existingProgress = progress.find(p => p.page_id === pageId);
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('page_flow_progress')
          .update({
            status,
            input_data: inputData || existingProgress.input_data,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id)
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        
        // Update local progress state
        setProgress(prev => 
          prev.map(p => p.id === data.id ? data : p)
        );
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('page_flow_progress')
          .insert([{
            assignment_id: assignment.id,
            page_id: pageId,
            status,
            input_data: inputData || null,
            completed_at: status === 'completed' ? new Date().toISOString() : null
          }])
          .select()
          .single();
          
        if (error) throw new Error(error.message);
        
        // Add to local progress state
        setProgress(prev => [...prev, data]);
      }
    } catch (e) {
      console.error('Error recording progress:', e);
    }
  };
  
  return {
    flow,
    currentPage,
    currentPageIndex,
    assignment,
    progress,
    loading,
    error,
    goToNextPage,
    goToPreviousPage,
    recordProgress,
    totalPages: flow?.pages?.length || 0
  };
}
