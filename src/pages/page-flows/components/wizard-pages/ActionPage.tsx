
import React, { useState } from "react";
import { Page, PageAction } from "../../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ActionPageProps {
  page: Page;
  onActionComplete: (actionData: Record<string, any>) => void;
}

export const ActionPage: React.FC<ActionPageProps> = ({ 
  page, 
  onActionComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const actions = page.actions || [];

  const handleActionClick = async (action: PageAction) => {
    setIsLoading(true);
    
    try {
      // Simulating action processing
      // In a real implementation, this would call appropriate APIs
      console.log('Executing action:', action);
      
      // Wait for simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return the action result
      onActionComplete({
        actionId: action.id,
        actionType: action.type,
        result: 'success',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page content */}
      {page.content && (
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
      
      <Separator />
      
      {/* Action buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Actions:</h3>
        
        <div className="flex flex-col space-y-2">
          {actions.length > 0 ? (
            actions.map(action => (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={isLoading}
                className="justify-start"
              >
                {action.label}
              </Button>
            ))
          ) : (
            <div className="text-muted-foreground italic">
              No actions available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
