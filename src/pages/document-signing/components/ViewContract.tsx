
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { convertDbInstanceToInstance, DocumentInstance } from '../types';
import PDFViewer from './PDFViewer';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ViewContractProps {
  contractId: string;
  onBack: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { variant: 'outline', label: 'Draft' };
      case 'sent':
        return { variant: 'secondary', label: 'Sent' };
      case 'signing':
        return { variant: 'default', label: 'In Progress' };
      case 'completed':
        return { variant: 'success', label: 'Completed' };
      default:
        return { variant: 'outline', label: status };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant={config.variant as any} className="capitalize">
      {config.label}
    </Badge>
  );
};

const ViewContract = ({ contractId, onBack }: ViewContractProps) => {
  const [contract, setContract] = useState<DocumentInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      try {
        // Fetch the contract details
        const { data: instanceData, error: instanceError } = await supabase
          .from('document_instances')
          .select('*')
          .eq('id', contractId)
          .single();

        if (instanceError) throw instanceError;

        const instanceContract = convertDbInstanceToInstance(instanceData);
        setContract(instanceContract);

        // Get the template data to retrieve the PDF
        const { data: templateData, error: templateError } = await supabase
          .from('document_templates')
          .select('pdf_data')
          .eq('id', instanceContract.template_id)
          .single();

        if (templateError) throw templateError;

        setPdfData(templateData.pdf_data);
        
        // Convert base64 to File object for the PDF viewer
        const base64Response = await fetch(`data:application/pdf;base64,${templateData.pdf_data}`);
        const blob = await base64Response.blob();
        const file = new File([blob], `${instanceContract.name}.pdf`, { type: 'application/pdf' });
        setPdfFile(file);
      } catch (error) {
        console.error('Error fetching contract:', error);
        toast.error('Failed to load contract details');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!contract || !pdfFile) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contracts
        </Button>
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">Contract not found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The contract you're looking for couldn't be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Contracts
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{contract.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={contract.status} />
            <span className="text-sm text-muted-foreground">
              Created on {new Date(contract.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-background">
        <h3 className="text-lg font-medium mb-4">Document Preview</h3>
        <PDFViewer file={pdfFile} />
      </div>
    </div>
  );
};

export default ViewContract;
