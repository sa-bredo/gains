
import { useState, useEffect, useCallback } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import {
  fetchPageFlows,
  fetchPageFlowWithPages,
  createPageFlow,
  updatePageFlow,
  deletePageFlow,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  duplicatePageFlow
} from "../services/page-flow-service";
import { PageFlow, Page, PageFlowWithPages } from "../types";
import { useToast } from "@/hooks/use-toast";

export function usePageFlows() {
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const [pageFlows, setPageFlows] = useState<PageFlow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<PageFlowWithPages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPageFlows = useCallback(async () => {
    if (!currentCompany) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const flows = await fetchPageFlows(currentCompany.id);
      setPageFlows(flows);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load page flows: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentCompany, toast]);

  const loadFlow = useCallback(async (flowId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const flow = await fetchPageFlowWithPages(flowId);
      setSelectedFlow(flow);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load flow: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFlow = useCallback(async (flowData: Partial<PageFlow>) => {
    if (!currentCompany) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newFlow = await createPageFlow(flowData, currentCompany.id);
      setPageFlows(prev => [...prev, newFlow]);
      toast({
        title: "Success",
        description: "Page flow created successfully"
      });
      return newFlow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to create flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentCompany, toast]);

  const updateFlow = useCallback(async (flowId: string, flowData: Partial<PageFlow>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFlow = await updatePageFlow(flowId, flowData);
      setPageFlows(prev => prev.map(flow => 
        flow.id === flowId ? { ...flow, ...updatedFlow } : flow
      ));
      
      if (selectedFlow && selectedFlow.id === flowId) {
        setSelectedFlow(prev => prev ? { ...prev, ...updatedFlow } : null);
      }
      
      toast({
        title: "Success",
        description: "Page flow updated successfully"
      });
      return updatedFlow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to update flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const deleteFlow = useCallback(async (flowId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deletePageFlow(flowId);
      setPageFlows(prev => prev.filter(flow => flow.id !== flowId));
      
      if (selectedFlow && selectedFlow.id === flowId) {
        setSelectedFlow(null);
      }
      
      toast({
        title: "Success",
        description: "Page flow deleted successfully"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to delete flow: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const addPage = useCallback(async (pageData: Partial<Page>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPage = await createPage(pageData);
      
      if (selectedFlow && newPage.flow_id === selectedFlow.id) {
        setSelectedFlow(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pages: [...prev.pages, newPage]
          };
        });
      }
      
      toast({
        title: "Success",
        description: "Page added successfully"
      });
      return newPage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to add page: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const updatePageInfo = useCallback(async (pageId: string, pageData: Partial<Page>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedPage = await updatePage(pageId, pageData);
      
      if (selectedFlow) {
        setSelectedFlow(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pages: prev.pages.map(page => 
              page.id === pageId ? { ...page, ...updatedPage } : page
            )
          };
        });
      }
      
      toast({
        title: "Success",
        description: "Page updated successfully"
      });
      return updatedPage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to update page: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const removePage = useCallback(async (pageId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await deletePage(pageId);
      
      if (selectedFlow) {
        setSelectedFlow(prev => {
          if (!prev) return null;
          return {
            ...prev,
            pages: prev.pages.filter(page => page.id !== pageId)
          };
        });
      }
      
      toast({
        title: "Success",
        description: "Page deleted successfully"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to delete page: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const reorderFlowPages = useCallback(async (flowId: string, pageIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await reorderPages(flowId, pageIds);
      
      if (selectedFlow && selectedFlow.id === flowId) {
        // Reorder the pages in memory based on the new order
        setSelectedFlow(prev => {
          if (!prev) return null;
          
          const pageMap = new Map(prev.pages.map(page => [page.id, page]));
          const reorderedPages = pageIds
            .map((id, index) => {
              const page = pageMap.get(id);
              return page ? { ...page, order_index: index } : null;
            })
            .filter((page): page is Page => page !== null);
          
          return {
            ...prev,
            pages: reorderedPages
          };
        });
      }
      
      toast({
        title: "Success",
        description: "Pages reordered successfully"
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to reorder pages: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedFlow, toast]);

  const cloneFlow = useCallback(async (flowId: string, newTitle: string) => {
    if (!currentCompany) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newFlow = await duplicatePageFlow(flowId, newTitle, currentCompany.id);
      setPageFlows(prev => [...prev, newFlow]);
      toast({
        title: "Success",
        description: "Page flow duplicated successfully"
      });
      return newFlow;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to duplicate flow: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentCompany, toast]);

  // Load flows when component mounts or currentCompany changes
  useEffect(() => {
    if (currentCompany) {
      loadPageFlows();
    }
  }, [currentCompany, loadPageFlows]);

  return {
    pageFlows,
    selectedFlow,
    loading,
    error,
    loadPageFlows,
    loadFlow,
    createFlow,
    updateFlow,
    deleteFlow,
    addPage,
    updatePageInfo,
    removePage,
    reorderFlowPages,
    cloneFlow,
    setSelectedFlow
  };
}
