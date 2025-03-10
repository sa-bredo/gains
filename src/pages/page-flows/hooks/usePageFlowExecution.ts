
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

export function usePageFlowExecution(props?: UsePageFlowExecutionProps) {
  const { flowId, assignmentId } = props || {};
  const [flow, setFlow] = useState<PageFlow | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [assignment, setAssignment] = useState<PageFlowAssignment | null>(null);
  const [progress, setProgress] = useState<PageFlowProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();
  const { currentCompany } = useCompany();
  
  const userId = currentUser?.id || '';

  useEffect(() => {
    if (!flowId && !assignmentId) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Mock implementation for now until tables are created
        if (assignmentId) {
          // Mock assignment data
          const mockAssignment: PageFlowAssignment = {
            id: assignmentId,
            flow_id: 'mock-flow-id',
            assigned_to: userId,
            status: 'in_progress',
            current_page_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Mock flow data
          const mockFlow: PageFlow = {
            id: 'mock-flow-id',
            company_id: currentCompany?.id || '',
            title: 'Mock Flow',
            description: 'Mock flow description',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: userId,
            is_active: true,
            pages: []
          };
          
          setAssignment(mockAssignment);
          setFlow(mockFlow);
          setCurrentPageIndex(mockAssignment.current_page_index || 0);
          
          // Mock progress data
          const mockProgress: PageFlowProgress[] = [];
          setProgress(mockProgress);
        } 
        else if (flowId) {
          // Mock flow data
          const mockFlow: PageFlow = {
            id: flowId,
            company_id: currentCompany?.id || '',
            title: 'Mock Flow',
            description: 'Mock flow description',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: userId,
            is_active: true,
            pages: []
          };
          
          setFlow(mockFlow);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [flowId, assignmentId, userId, currentCompany]);
  
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
  
  // Method to move to the next page
  const moveToNextPage = async (assignmentId: string, pageId: string, nextPageIndex: number) => {
    try {
      // Simulate updating the assignment in database
      console.log(`Moving assignment ${assignmentId} to page index ${nextPageIndex}`);
      setCurrentPageIndex(nextPageIndex);
      
      return { success: true };
    } catch (error) {
      console.error('Error moving to next page:', error);
      return { success: false, error };
    }
  };
  
  // Method to move to the previous page
  const moveToPreviousPage = async (assignmentId: string, prevPageIndex: number) => {
    try {
      // Simulate updating the assignment in database
      console.log(`Moving assignment ${assignmentId} to page index ${prevPageIndex}`);
      setCurrentPageIndex(prevPageIndex);
      
      return { success: true };
    } catch (error) {
      console.error('Error moving to previous page:', error);
      return { success: false, error };
    }
  };
  
  // Method to record progress for a page
  const recordProgress = async (
    pageId: string, 
    status: PageFlowStatus,
    inputData?: Record<string, any>
  ) => {
    if (!assignment) return { success: false, error: 'No assignment' };
    
    try {
      // Simulate recording progress in database
      console.log(`Recording progress for page ${pageId} with status ${status}`);
      
      const newProgress: PageFlowProgress = {
        id: `mock-progress-${Date.now()}`,
        assignment_id: assignment.id,
        page_id: pageId,
        status,
        input_data: inputData || null,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProgress(prev => [...prev, newProgress]);
      
      return { success: true };
    } catch (error) {
      console.error('Error recording progress:', error);
      return { success: false, error };
    }
  };
  
  // Method to handle action results
  const recordActionResult = async (
    assignmentId: string,
    pageId: string, 
    actionData: Record<string, any>
  ) => {
    try {
      // Simulate recording action result
      console.log(`Recording action result for page ${pageId}:`, actionData);
      
      await recordProgress(pageId, 'completed', actionData);
      
      return { success: true };
    } catch (error) {
      console.error('Error recording action result:', error);
      return { success: false, error };
    }
  };
  
  // Method to complete the flow
  const completeFlow = async (assignmentId: string) => {
    try {
      // Simulate completing the flow
      console.log(`Completing flow for assignment ${assignmentId}`);
      
      if (assignment) {
        const updatedAssignment = {
          ...assignment,
          status: 'completed' as PageFlowStatus,
          completed_at: new Date().toISOString()
        };
        
        setAssignment(updatedAssignment);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error completing flow:', error);
      return { success: false, error };
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
    moveToNextPage,
    moveToPreviousPage,
    recordProgress,
    recordActionResult,
    completeFlow,
    totalPages: flow?.pages?.length || 0
  };
}
