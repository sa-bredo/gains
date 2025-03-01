
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { convertDbInstanceToInstance, DocumentInstance } from '../types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ViewContract from './ViewContract';

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

const SentContractsList = () => {
  const [sentContracts, setSentContracts] = useState<DocumentInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const fetchSentContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document_instances')
        .select('*')
        .not('status', 'eq', 'draft')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const instances = data.map(convertDbInstanceToInstance);
      setSentContracts(instances);
    } catch (error) {
      console.error('Error fetching sent contracts:', error);
      toast.error('Failed to load sent contracts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentContracts();
  }, []);

  const viewContract = (id: string) => {
    setSelectedContractId(id);
  };

  const handleBackToList = () => {
    setSelectedContractId(null);
  };

  if (selectedContractId) {
    return <ViewContract contractId={selectedContractId} onBack={handleBackToList} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (sentContracts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">No sent contracts yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          When you send documents for signature, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sentContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.name}</TableCell>
                <TableCell>
                  <StatusBadge status={contract.status} />
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewContract(contract.id)}
                    className="inline-flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SentContractsList;
