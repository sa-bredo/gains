
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { connectEmployeeToSlack, disconnectEmployeeFromSlack, getSlackEmployees } from '../services/slack-service';
import { SlackEmployeeIntegration } from '../types';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface SlackEmployeeWithInfo {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  slack_user_id: string | null;
  slack_username: string | null;
  slack_connected: boolean;
  slack_connected_at: string | null;
}

export function SlackEmployeeManager() {
  const { company } = useCompany();
  const [employees, setEmployees] = useState<SlackEmployeeWithInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (company?.id) {
      loadEmployees();
    }
  }, [company?.id]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const empData = await getSlackEmployees();
      setEmployees(empData || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (employeeId: string) => {
    if (!company?.id) return;
    
    setConnecting(employeeId);
    try {
      const result = await connectEmployeeToSlack(employeeId, company.id);
      
      if (result.success) {
        toast.success('Employee connected to Slack');
        loadEmployees();
      } else {
        toast.error(result.message || 'Failed to connect employee');
      }
    } catch (error) {
      console.error('Error connecting employee:', error);
      toast.error('Failed to connect employee to Slack');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (employeeId: string) => {
    setConnecting(employeeId);
    try {
      const success = await disconnectEmployeeFromSlack(employeeId);
      
      if (success) {
        toast.success('Employee disconnected from Slack');
        loadEmployees();
      } else {
        toast.error('Failed to disconnect employee');
      }
    } catch (error) {
      console.error('Error disconnecting employee:', error);
      toast.error('Failed to disconnect employee from Slack');
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Employee Slack Accounts</CardTitle>
        <CardDescription>
          Connect your employees to their Slack accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Slack Username</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No employees found
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
                    {employee.slack_connected ? (
                      <Badge variant="success" className="bg-green-500">
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500">
                        <X className="h-3.5 w-3.5 mr-1" />
                        Not Connected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.slack_username || 'Not connected'}
                  </TableCell>
                  <TableCell>
                    {employee.slack_connected ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(employee.employee_id)}
                        disabled={connecting === employee.employee_id}
                      >
                        {connecting === employee.employee_id
                          ? 'Disconnecting...'
                          : 'Disconnect'}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleConnect(employee.employee_id)}
                        disabled={connecting === employee.employee_id}
                      >
                        {connecting === employee.employee_id
                          ? 'Connecting...'
                          : 'Connect'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
