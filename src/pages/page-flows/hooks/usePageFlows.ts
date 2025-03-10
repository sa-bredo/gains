
import { useState, useEffect, useCallback } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import {
  getPageFlows,
  getPageFlowWithPages,
  createPageFlow,
  updateFlow,
  deletePageFlow,
  addPage,
  updatePageInfo,
  deletePage,
  updatePagesOrder,
  createFlow
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
      const flows = await getPageFlows(currentCompany.id);
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
      const flow = await getPageFlowWithPages(flowId);
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

  const createNewFlow = useCallback(async (flowData: Partial<PageFlow>) => {
    if (!currentCompany) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Always associate with the current company
      const flowWithCompany = {
        ...flowData,
        company_id: currentCompany.id,
      };
      
      const newFlow = await createFlow(flowWithCompany);
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

  const updateExistingFlow = useCallback(async (flowId: string, flowData: Partial<PageFlow>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFlow = await updateFlow(flowId, flowData);
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

  const addNewPage = useCallback(async (pageData: Partial<Page>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newPage = await addPage(pageData);
      
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
      const updatedPage = await updatePageInfo(pageId, pageData);
      
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
      await updatePagesOrder(pageIds.map((id, index) => ({ id, order_index: index })));
      
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
      // Since duplicatePageFlow is not available, we'll use getPageFlowWithPages and createFlow
      const originalFlow = await getPageFlowWithPages(flowId);
      
      if (!originalFlow) {
        throw new Error("Original flow not found");
      }
      
      // Create a new flow with the same data but a new title
      const newFlowData: Partial<PageFlow> = {
        title: newTitle,
        description: originalFlow.description,
        data_binding_type: originalFlow.data_binding_type,
        data_binding_id: originalFlow.data_binding_id,
        is_active: originalFlow.is_active
      };
      
      const newFlow = await createFlow(newFlowData);
      
      // Now add all the pages from the original flow to the new flow
      for (const page of originalFlow.pages) {
        const newPageData: Partial<Page> = {
          flow_id: newFlow.id,
          title: page.title,
          description: page.description,
          page_type: page.page_type,
          content: page.content,
          actions: page.actions,
          automation_config: page.automation_config,
          document_id: page.document_id,
          order_index: page.order_index
        };
        
        await addPage(newPageData);
      }
      
      // Refresh the flows list
      const flows = await getPageFlows(currentCompany.id);
      setPageFlows(flows);
      
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
    createFlow: createNewFlow,
    updateFlow: updateExistingFlow,
    deleteFlow,
    addPage: addNewPage,
    updatePageInfo,
    removePage,
    reorderFlowPages,
    cloneFlow,
    setSelectedFlow
  };
}

