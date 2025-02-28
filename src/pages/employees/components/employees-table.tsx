
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Loader2, Send } from "lucide-react";
import { Employee } from "..";

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
  onInvite: (employeeId: string) => Promise<void>;
}

export function EmployeesTable({ employees, loading, onInvite }: EmployeesTableProps) {
  const [invitingId, setInvitingId] = useState<string | null>(null);
  
  const handleInvite = async (employeeId: string) => {
    setInvitingId(employeeId);
    try {
      await onInvite(employeeId);
    } finally {
      setInvitingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>A list of all employees in your organization</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No employees found. Add your first employee to get started.
            </TableCell>
          </TableRow>
        ) : (
          employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {employee.first_name} {employee.last_name}
                <div className="text-xs text-muted-foreground mt-1">
                  {employee.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={employee.role === 'Admin' ? 'default' : 'outline'}
                  className={
                    employee.role === 'Admin' 
                      ? 'bg-primary' 
                      : employee.role === 'Manager' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-muted'
                  }
                >
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-sm">
                    <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                    {employee.email}
                  </div>
                  {employee.mobile_number && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                      {employee.mobile_number}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {employee.invited ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Invited
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Not Invited
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {!employee.invited && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleInvite(employee.id)}
                    disabled={invitingId === employee.id}
                  >
                    {invitingId === employee.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-2" />
                        Invite
                      </>
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
