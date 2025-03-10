
import React from "react";
import { PageFlowsList } from "./components/PageFlowsList";
import { MainLayout } from "@/layouts/MainLayout";
import { usePageFlows } from "./hooks/usePageFlows";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const PageFlowsPage: React.FC = () => {
  const { pageFlows, loading, error, deleteFlow, cloneFlow, loadPageFlows } = usePageFlows();
  
  return (
    <div className="flex w-full">
      <MainLayout />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Page Flows</h1>
          <Button asChild>
            <Link to="/page-flows/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Flow
            </Link>
          </Button>
        </div>
        
        {loading && (
          <div className="text-center p-8">
            <p className="text-muted-foreground">Loading page flows...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center p-8 text-destructive">
            <p>Error loading page flows: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadPageFlows()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}
        
        {!loading && !error && (
          <PageFlowsList 
            flows={pageFlows} 
            onDelete={deleteFlow}
            onDuplicate={cloneFlow}
          />
        )}
      </div>
    </div>
  );
};

export default PageFlowsPage;
