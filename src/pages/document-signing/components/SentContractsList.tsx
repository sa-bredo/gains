
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { convertDbInstanceToInstance, DocumentInstance } from '../types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Eye, FileText, Download, Share2, CheckCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ViewContract from './ViewContract';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

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

interface SigningStatus {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  role: string;
  status: 'pending' | 'signed';
  is_manager: boolean;
}

const SentContractsList = () => {
  const [sentContracts, setSentContracts] = useState<DocumentInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<DocumentInstance | null>(null);
  const [showStatusDetail, setShowStatusDetail] = useState(false);
  const [signingStatuses, setSigningStatuses] = useState<SigningStatus[]>([]);
  
  // Mock signing statuses for demonstration - in a real app, this would come from the database
  const generateMockSigningStatuses = (contract: DocumentInstance) => {
    // This is just for demonstration - in a real app, this data would come from the database
    return [
      {
        employee_id: '1',
        employee_name: 'Andrew Bredon',
        employee_email: 'andrew@example.com',
        role: 'Manager',
        status: 'pending' as const,
        is_manager: true
      },
      {
        employee_id: '2',
        employee_name: 'Sarah Miller',
        employee_email: 'sarah@example.com',
        role: 'Employee',
        status: 'pending' as const,
        is_manager: false
      }
    ];
  };

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

  const viewContractStatus = (contract: DocumentInstance) => {
    setSelectedContract(contract);
    setSigningStatuses(generateMockSigningStatuses(contract));
    setShowStatusDetail(true);
  };

  const handleBackToList = () => {
    setSelectedContractId(null);
    setShowStatusDetail(false);
    setSelectedContract(null);
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

  if (showStatusDetail && selectedContract) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{selectedContract.name}</h2>
          <Button variant="outline" onClick={handleBackToList}>Back to Contracts</Button>
        </div>
        
        <Card>
          <CardContent className="pt-6 space-y-8">
            <h3 className="text-xl font-semibold">Document Status</h3>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Document Signing Status</h4>
                <StatusBadge status={selectedContract.status} />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-5 w-5 ${selectedContract.status !== 'draft' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={selectedContract.status !== 'draft' ? 'text-green-700' : 'text-gray-500'}>
                    Document Prepared
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-5 w-5 ${selectedContract.status !== 'draft' && selectedContract.status !== 'sent' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={selectedContract.status !== 'draft' && selectedContract.status !== 'sent' ? 'text-green-700' : 'text-gray-500'}>
                    Non-Manager Signatures Complete
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`h-5 w-5 ${selectedContract.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={selectedContract.status === 'completed' ? 'text-green-700' : 'text-gray-500'}>
                    Manager Signatures Complete
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className={`h-5 w-5 ${selectedContract.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={selectedContract.status === 'completed' ? 'text-green-700' : 'text-gray-500'}>
                    Final Document Sent
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-4">Signature Status</h4>
              
              <div className="space-y-2">
                <div className="grid grid-cols-3 font-medium text-sm px-2 pb-2 border-b">
                  <div>Signer</div>
                  <div>Role</div>
                  <div>Status</div>
                </div>
                
                {signingStatuses.map((status, index) => (
                  <div key={index} className="grid grid-cols-3 text-sm py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {status.employee_name.split(' ').map(name => name[0]).join('')}
                      </span>
                      <div>
                        <div>{status.employee_name}</div>
                        <div className="text-xs text-muted-foreground">{status.employee_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {status.role}
                    </div>
                    <div className="flex items-center">
                      <Badge variant={status.status === 'signed' ? "default" : "outline"}>
                        {status.status === 'signed' ? "Signed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2" onClick={handleBackToList}>
                Back to List
              </Button>
              <Button onClick={() => viewContract(selectedContract.id)}>
                View Document
              </Button>
            </div>
          </CardContent>
        </Card>
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
                    onClick={() => viewContractStatus(contract)}
                    className="inline-flex items-center gap-1 mr-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Status</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => viewContract(contract.id)}
                    className="inline-flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Document</span>
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
