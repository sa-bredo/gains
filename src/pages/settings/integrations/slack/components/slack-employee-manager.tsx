
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, RefreshCw, Link, Unlink, UserRoundPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SlackConfig, SlackEmployee } from '../types';
import { Employee } from '@/pages/employees';

interface SlackEmployeeManagerProps {
  slackConfig: SlackConfig | null;
}

export function SlackEmployeeManager({ slackConfig }: SlackEmployeeManagerProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<(Employee & Partial<SlackEmployee>)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (slackConfig) {
      fetchEmployeesWithSlackData();
    }
  }, [slackConfig]);

  const fetchEmployeesWithSlackData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('last_name');
      
      if (employeesError) throw employeesError;
      
      // Fetch Slack employee mapping
      const { data: slackEmployeeData, error: slackError } = await supabase
        .from('slack_employees')
        .select('*');
      
      if (slackError) throw slackError;
      
      // Combine the data
      const combinedData = employeesData.map(employee => {
        const slackData = slackEmployeeData.find(se => se.employee_id === employee.id);
        return {
          ...employee,
          ...(slackData || {}),
        };
      });
      
      setEmployees(combinedData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({
        variant: "destructive",
        title: "Failed to load employees",
        description: "There was an error loading employee data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSlackUsers = async () => {
    try {
      setRefreshing(true);
      
      await supabase.functions.invoke('refresh-slack-users', {
        body: { workspace_id: slackConfig?.slack_workspace_id },
      });
      
      toast({
        title: "Refreshed Slack Users",
        description: "Successfully refreshed Slack user data",
      });
      
      await fetchEmployeesWithSlackData();
    } catch (error) {
      console.error('Error refreshing Slack users:', error);
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: "Failed to refresh Slack user data",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleConnectEmployee = async (employeeId: string) => {
    try {
      const result = await supabase.functions.invoke('connect-slack-employee', {
        body: { 
          employee_id: employeeId,
          workspace_id: slackConfig?.slack_workspace_id
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Connected Employee",
        description: "Successfully connected employee to Slack account",
      });
      
      await fetchEmployeesWithSlackData();
    } catch (error) {
      console.error('Error connecting employee:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect employee to Slack",
      });
    }
  };

  const handleDisconnectEmployee = async (employeeId: string) => {
    try {
      await supabase.functions.invoke('disconnect-slack-employee', {
        body: { employee_id: employeeId },
      });
      
      toast({
        title: "Disconnected Employee",
        description: "Successfully disconnected employee from Slack account",
      });
      
      await fetchEmployeesWithSlackData();
    } catch (error) {
      console.error('Error disconnecting employee:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: "Failed to disconnect employee from Slack",
      });
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      searchQuery === '' || 
      employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = 
      selectedRole === '' || 
      employee.role === selectedRole;
      
    return matchesSearch && matchesRole;
  });

  const roleOptions = [...new Set(employees.map(emp => emp.role))].sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Slack Accounts</CardTitle>
        <CardDescription>Link employee records with Slack accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search employees..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {roleOptions.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshSlackUsers}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Slack Users
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Slack Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[250px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-9 w-[100px]" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No employees found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map(employee => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>
                        {employee.slack_connected ? (
                          <span className="text-sm">
                            {employee.slack_username} 
                            <span className="text-muted-foreground"> 
                              ({employee.slack_user_id})
                            </span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not connected</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.slack_connected ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Not Connected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.slack_connected ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisconnectEmployee(employee.id)}
                          >
                            <Unlink className="h-4 w-4 mr-2" />
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnectEmployee(employee.id)}
                          >
                            <Link className="h-4 w-4 mr-2" />
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
          
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
            <div className="text-sm">
              <span className="font-medium">{employees.filter(e => e.slack_connected).length}</span> connected ·{' '}
              <span className="font-medium">{employees.length - employees.filter(e => e.slack_connected).length}</span> not connected
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
