
import React, { useState, useEffect } from "react";
import { Page, PageFlowAssignmentWithFlow } from "../../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Check } from "lucide-react";

interface DocumentPageProps {
  page: Page;
  assignment: PageFlowAssignmentWithFlow;
  onComplete: () => void;
}

export const DocumentPage: React.FC<DocumentPageProps> = ({
  page,
  assignment,
  onComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading document
    const loadDocument = async () => {
      try {
        // Simulate API call to fetch document
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      } catch (err) {
        setError('Failed to load document');
        setLoading(false);
      }
    };
    
    loadDocument();
  }, [page.document_id]);

  const handleSignDocument = async () => {
    setLoading(true);
    
    try {
      // Simulate document signing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSigned(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to sign document');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={onComplete}>Continue Anyway</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">{page.title}</h3>
      
      {page.content && (
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
      
      <Card>
        <CardContent className="pt-6 flex flex-col items-center space-y-6">
          <FileText className="h-16 w-16 text-primary" />
          
          <div className="text-center">
            <h4 className="text-lg font-medium mb-2">Document Ready for Signature</h4>
            <p className="text-muted-foreground">
              Please review and sign the document to continue.
            </p>
          </div>
          
          {signed ? (
            <div className="flex items-center space-x-2 text-green-500">
              <Check className="h-5 w-5" />
              <span>Document signed successfully!</span>
            </div>
          ) : (
            <Button onClick={handleSignDocument} className="px-8">
              Sign Document
            </Button>
          )}
        </CardContent>
      </Card>
      
      {signed && (
        <div className="flex justify-center">
          <Button onClick={onComplete}>Continue</Button>
        </div>
      )}
    </div>
  );
};
