
import React from 'react';
import { Page } from '../../types';

export interface PageDocumentEditorProps {
  page: Page;
  onUpdate: (updates: Partial<Page>) => Promise<void>;
}

export const PageDocumentEditor: React.FC<PageDocumentEditorProps> = ({ 
  page, 
  onUpdate 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Document Configuration</h3>
      <p className="text-muted-foreground">
        This is a placeholder for the document editor. 
        You'll be able to select and configure documents here.
      </p>
      <div className="p-4 border rounded-md bg-muted/50">
        <p>Document ID: {page.document_id || 'None selected'}</p>
      </div>
    </div>
  );
};
