
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee } from "..";

interface EmployeesTableProps {
  employees: Employee[];
  loading: boolean;
  onInvite: (employeeId: string) => Promise<void>;
}

export function EmployeesTable({ employees, loading, onInvite }: EmployeesTableProps) {
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No employees found. Add your first employee to get started.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {employee.first_name} {employee.last_name}
              </TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.mobile_number || "—"}</TableCell>
              <TableCell>
                {employee.invited ? (
                  <Badge variant="secondary">Invited</Badge>
                ) : (
                  <Badge variant="outline">Not Invited</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {!employee.invited && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInvite(employee.id)}
                  >
                    Invite
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
