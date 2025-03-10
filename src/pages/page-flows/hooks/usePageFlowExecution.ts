
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchUserAssignments,
  assignPageFlow,
  updateAssignment,
  recordPageProgress
} from "../services/page-flow-service";
import { 
  PageFlowAssignment, 
  PageFlowProgress, 
  PageFlowAssignmentWithFlow,
  PageFlowStatus 
} from "../types";
import { useToast } from "@/hooks/use-toast";

export function usePageFlowExecution() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<PageFlowAssignmentWithFlow[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<PageFlowAssignmentWithFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserAssignments = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userAssignments = await fetchUserAssignments(user.id);
      setAssignments(userAssignments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load assignments: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createAssignment = useCallback(async (flowId: string, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newAssignment = await assignPageFlow(flowId, userId);
      toast({
        title: "Success",
        description: "Flow assigned successfully"
      });
      await loadUserAssignments(); // Reload to get the flow data
      return newAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to assign flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadUserAssignments, toast]);

  const startPageFlow = useCallback(async (assignmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAssignment = await updateAssignment(assignmentId, {
        status: 'in_progress',
        current_page_index: 0
      });
      
      // Update the assignment in the list
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId ? {...a, ...updatedAssignment} : a
        )
      );
      
      // Set as current assignment
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        setCurrentAssignment({...assignment, ...updatedAssignment});
      }
      
      toast({
        title: "Success",
        description: "Flow started successfully"
      });
      
      return updatedAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to start flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [assignments, toast]);

  const moveToNextPage = useCallback(async (
    assignmentId: string, 
    currentPageId: string,
    nextPageIndex: number
  ) => {
    if (!currentAssignment) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mark current page as completed
      await recordPageProgress(assignmentId, currentPageId, 'completed');
      
      // Update the assignment's current page index
      const updatedAssignment = await updateAssignment(assignmentId, {
        current_page_index: nextPageIndex
      });
      
      // If next page exists, mark it as in progress
      if (currentAssignment.flow.pages[nextPageIndex]) {
        await recordPageProgress(
          assignmentId, 
          currentAssignment.flow.pages[nextPageIndex].id, 
          'in_progress'
        );
      }
      
      // If we've reached the end of the flow, mark it as completed
      if (nextPageIndex >= currentAssignment.flow.pages.length) {
        await updateAssignment(assignmentId, {
          status: 'completed',
          completed_at: new Date().toISOString()
        });
      }
      
      // Update local state
      setCurrentAssignment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedAssignment,
          current_page_index: nextPageIndex,
          status: nextPageIndex >= prev.flow.pages.length ? 'completed' : prev.status
        };
      });
      
      await loadUserAssignments(); // Refresh all assignments
      
      return updatedAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to move to next page: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentAssignment, loadUserAssignments, toast]);

  const moveToPreviousPage = useCallback(async (
    assignmentId: string,
    prevPageIndex: number
  ) => {
    if (!currentAssignment || prevPageIndex < 0) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update the assignment's current page index
      const updatedAssignment = await updateAssignment(assignmentId, {
        current_page_index: prevPageIndex
      });
      
      // Update local state
      setCurrentAssignment(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updatedAssignment,
          current_page_index: prevPageIndex
        };
      });
      
      return updatedAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to move to previous page: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentAssignment, toast]);

  const recordActionResult = useCallback(async (
    assignmentId: string,
    pageId: string,
    inputData: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const progress = await recordPageProgress(
        assignmentId, 
        pageId, 
        'in_progress', 
        inputData
      );
      
      toast({
        title: "Success",
        description: "Action recorded successfully"
      });
      
      return progress;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to record action: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const completeFlow = useCallback(async (assignmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedAssignment = await updateAssignment(assignmentId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      
      // Update local state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId ? {...a, ...updatedAssignment} : a
        )
      );
      
      setCurrentAssignment(null);
      
      toast({
        title: "Success",
        description: "Flow completed successfully"
      });
      
      return updatedAssignment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to complete flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load user assignments on mount
  useEffect(() => {
    if (user) {
      loadUserAssignments();
    }
  }, [user, loadUserAssignments]);

  return {
    assignments,
    currentAssignment,
    loading,
    error,
    loadUserAssignments,
    createAssignment,
    startPageFlow,
    moveToNextPage,
    moveToPreviousPage,
    recordActionResult,
    completeFlow,
    setCurrentAssignment
  };
}
