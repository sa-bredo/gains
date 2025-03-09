
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSlackConfig, useSlackEmployees } from "../services/slack-service";

const statusMap: Record<string, string> = {
  connected: "Connected",
  pending: "Pending",
  failed: "Failed",
};

const SlackEmployeeManager = () => {
  const { toast } = useToast();
  const { slackEmployees, connectEmployee, disconnectEmployee, isLoading, error, refetchSlackEmployees } = useSlackEmployees();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error instanceof Error ? error.message : String(error)}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Slack Employees</h2>
      <Table>
        <TableCaption>A list of employees connected to Slack.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slackEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.employee_name}</TableCell>
              <TableCell>{employee.employee_email}</TableCell>
              <TableCell>
                <Badge variant="secondary">{statusMap[employee.status || 'pending']}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <DotsHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        if (employee.status === 'connected') {
                          disconnectEmployee.mutateAsync(employee.employee_id)
                            .then(() => {
                              toast({
                                title: "Employee disconnected",
                                description: `${employee.employee_name} has been disconnected from Slack.`,
                              });
                              refetchSlackEmployees();
                            })
                            .catch((err) => {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to disconnect employee from Slack.",
                              });
                            });
                        } else {
                          connectEmployee.mutateAsync(employee.employee_id)
                            .then(() => {
                              toast({
                                title: "Employee connected",
                                description: `${employee.employee_name} has been connected to Slack.`,
                              });
                              refetchSlackEmployees();
                            })
                            .catch((err) => {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to connect employee to Slack.",
                              });
                            });
                        }
                      }}
                    >
                      {employee.status === 'connected' ? "Disconnect" : "Connect"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SlackEmployeeManager;
