
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageFlowWizard } from "../components/PageFlowWizard";
import { MainLayout } from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageFlows } from "../hooks/usePageFlows";
import { Plus } from "lucide-react";

const NewPageFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const [creationMode, setCreationMode] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
  const handleComplete = () => {
    navigate("/page-flows");
  };
  
  const handleExit = () => {
    navigate("/page-flows");
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Create New Page Flow</h1>
        
        {!creationMode && !selectedAssignment && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                The page flow creator will guide you through creating a new workflow.
              </p>
              <Button 
                onClick={() => setCreationMode(true)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Creating Flow
              </Button>
            </CardContent>
          </Card>
        )}
        
        {creationMode && !selectedAssignment && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Creating a new flow...
              </p>
              <Button 
                variant="outline"
                onClick={() => setCreationMode(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}
        
        {selectedAssignment && (
          <PageFlowWizard 
            assignment={selectedAssignment} 
            onComplete={handleComplete} 
            onExit={handleExit} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default NewPageFlowPage;
