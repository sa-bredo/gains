
import React, { useState, useEffect } from "react";
import { 
  PageFlowAssignmentWithFlow, 
  Page 
} from "../types";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePageFlowExecution } from "../hooks/usePageFlowExecution";
import { ContentPage } from "./wizard-pages/ContentPage";
import { ActionPage } from "./wizard-pages/ActionPage";
import { AutomationPage } from "./wizard-pages/AutomationPage";
import { DocumentPage } from "./wizard-pages/DocumentPage";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface PageFlowWizardProps {
  assignment: PageFlowAssignmentWithFlow;
  onComplete?: () => void;
  onExit?: () => void;
}

export const PageFlowWizard: React.FC<PageFlowWizardProps> = ({
  assignment,
  onComplete,
  onExit
}) => {
  const { 
    moveToNextPage, 
    moveToPreviousPage, 
    completeFlow,
    recordActionResult
  } = usePageFlowExecution({
    assignmentId: assignment.id
  });
  
  const [currentPageIndex, setCurrentPageIndex] = useState(assignment.current_page_index);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const flow = assignment.flow;
  const pages = flow.pages.sort((a, b) => a.order_index - b.order_index);
  const currentPage = pages[currentPageIndex];
  
  useEffect(() => {
    setCurrentPageIndex(assignment.current_page_index);
  }, [assignment.current_page_index]);

  const handleNext = async () => {
    if (!currentPage) return;
    
    setIsProcessing(true);
    
    const nextPageIndex = currentPageIndex + 1;
    await moveToNextPage(assignment.id, currentPage.id, nextPageIndex);
    
    if (nextPageIndex >= pages.length) {
      // We've reached the end of the flow
      await completeFlow(assignment.id);
      if (onComplete) onComplete();
    } else {
      setCurrentPageIndex(nextPageIndex);
    }
    
    setIsProcessing(false);
  };

  const handleBack = async () => {
    if (currentPageIndex <= 0) return;
    
    setIsProcessing(true);
    
    const prevPageIndex = currentPageIndex - 1;
    await moveToPreviousPage(assignment.id, prevPageIndex);
    setCurrentPageIndex(prevPageIndex);
    
    setIsProcessing(false);
  };

  const handleActionCompleted = async (actionData: Record<string, any>) => {
    if (!currentPage) return;
    
    setIsProcessing(true);
    
    await recordActionResult(assignment.id, currentPage.id, actionData);
    await handleNext();
    
    setIsProcessing(false);
  };

  const renderPageContent = () => {
    if (!currentPage) return null;
    
    switch (currentPage.page_type) {
      case 'content':
        return <ContentPage page={currentPage} onNext={handleNext} />;
      case 'action':
        return <ActionPage page={currentPage} onActionComplete={handleActionCompleted} />;
      case 'automation':
        return <AutomationPage page={currentPage} assignment={assignment} onComplete={handleNext} />;
      case 'document':
        return <DocumentPage page={currentPage} assignment={assignment} onComplete={handleNext} />;
      default:
        return <div>Unknown page type</div>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{flow.title}</CardTitle>
        <CardDescription>{flow.description}</CardDescription>
      </CardHeader>
      <Tabs value={`step-${currentPageIndex}`} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {pages.map((page, index) => (
            <TabsTrigger 
              key={page.id} 
              value={`step-${index}`}
              disabled={true}
              className={`${
                index < currentPageIndex 
                  ? 'text-primary' 
                  : index === currentPageIndex 
                    ? 'bg-primary text-primary-foreground'
                    : ''
              }`}
            >
              {index < currentPageIndex && (
                <Check className="h-4 w-4 mr-1" />
              )}
              {page.title}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={`step-${currentPageIndex}`} className="mt-4">
          <CardContent className="min-h-[300px]">
            {renderPageContent()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentPageIndex === 0 ? onExit : handleBack}
              disabled={isProcessing}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {currentPageIndex === 0 ? 'Exit' : 'Back'}
            </Button>

            {currentPage?.page_type !== 'action' && currentPage?.page_type !== 'automation' && currentPage?.page_type !== 'document' && (
              <Button 
                onClick={handleNext}
                disabled={isProcessing}
              >
                {currentPageIndex >= pages.length - 1 ? 'Complete' : 'Next'}
                {currentPageIndex >= pages.length - 1 ? (
                  <Check className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </Button>
            )}
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
