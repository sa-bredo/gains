
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { connectEmployeeToSlack, disconnectEmployeeFromSlack, getSlackConfig, getSlackEmployees } from '../services/slack-service';
import { useCompany } from '@/contexts/CompanyContext';
import { Badge } from '@/components/ui/badge';

export function SlackEmployeeManager() {
  const { currentCompany } = useCompany();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    loadEmployees();
  }, []);
  
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const employees = await getSlackEmployees();
      setEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: 'Error loading employees',
        description: 'Could not fetch employee data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnect = async (employeeId: string) => {
    if (!currentCompany?.id) return;
    
    setConnecting(employeeId);
    try {
      const config = await getSlackConfig(currentCompany.id);
      if (!config?.slack_workspace_id) {
        toast({
          title: 'Not connected to Slack',
          description: 'Please connect to a Slack workspace first.',
          variant: 'destructive',
        });
        return;
      }
      
      const result = await connectEmployeeToSlack(employeeId, currentCompany.id);
      
      if (result.success) {
        toast({
          title: 'Employee connected',
          description: 'Successfully connected employee to Slack.',
          variant: 'default',
        });
        
        // Refresh employees list
        loadEmployees();
      } else {
        toast({
          title: 'Connection failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error connecting employee:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setConnecting(null);
    }
  };
  
  const handleDisconnect = async (employeeId: string) => {
    setDisconnecting(employeeId);
    try {
      const result = await disconnectEmployeeFromSlack(employeeId);
      
      if (result) {
        toast({
          title: 'Employee disconnected',
          description: 'Successfully disconnected employee from Slack.',
          variant: 'default',
        });
        
        // Refresh employees list
        loadEmployees();
      } else {
        toast({
          title: 'Disconnection failed',
          description: 'Failed to disconnect employee from Slack.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error disconnecting employee:', error);
      toast({
        title: 'Disconnection failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(null);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Slack Employee Connections</CardTitle>
            <CardDescription>
              Connect your employees to their Slack accounts
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={loadEmployees}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Slack Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        {employee.slack_username || 'Not connected'}
                      </TableCell>
                      <TableCell>
                        {employee.slack_connected ? (
                          <Badge>Connected</Badge>
                        ) : (
                          <Badge variant="outline">Not Connected</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.slack_connected ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnect(employee.id)}
                            disabled={disconnecting === employee.id}
                          >
                            {disconnecting === employee.id && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(employee.id)}
                            disabled={connecting === employee.id}
                            variant="outline"
                          >
                            {connecting === employee.id && (
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Connect
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
