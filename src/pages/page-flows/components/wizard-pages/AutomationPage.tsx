
import React, { useEffect, useState } from "react";
import { Page, PageFlowAssignmentWithFlow } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AutomationPageProps {
  page: Page;
  assignment: PageFlowAssignmentWithFlow;
  onComplete: () => void;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({
  page,
  assignment,
  onComplete
}) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Running automation...');
  
  useEffect(() => {
    const runAutomation = async () => {
      try {
        if (!page.automation_config) {
          throw new Error('No automation configuration provided');
        }

        // Simulate running the automation
        console.log('Running automation:', page.automation_config);
        
        // Wait to simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful completion
        setStatus('success');
        setMessage(`${page.automation_config.type} automation completed successfully!`);
        
        // Automatically proceed after a delay
        setTimeout(() => {
          onComplete();
        }, 1500);
      } catch (error) {
        console.error('Automation failed:', error);
        setStatus('error');
        setMessage(`Automation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    runAutomation();
  }, [page, assignment, onComplete]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
        {page.title} - Automation
      </h3>
      
      {page.content && (
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
      
      <Card>
        <CardContent className="pt-6 pb-6 flex flex-col items-center justify-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-lg">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-lg">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg">{message}</p>
              <Button onClick={onComplete}>Continue Anyway</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
