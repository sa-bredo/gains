
import React from 'react';
import { Page } from '../../types';

export interface PageAutomationEditorProps {
  page: Page;
  onUpdate: (updates: Partial<Page>) => Promise<void>;
}

export const PageAutomationEditor: React.FC<PageAutomationEditorProps> = ({ 
  page, 
  onUpdate 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Automation Configuration</h3>
      <p className="text-muted-foreground">
        This is a placeholder for the automation editor. 
        You'll be able to configure automation actions here.
      </p>
      <div className="p-4 border rounded-md bg-muted/50">
        <p>Automation Type: {page.automation_config?.type || 'None configured'}</p>
      </div>
    </div>
  );
};
