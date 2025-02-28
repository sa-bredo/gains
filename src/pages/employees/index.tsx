
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Plus } from "lucide-react";
import { AddEmployeeDialog } from "./components/add-employee-dialog";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "Admin" | "Manager" | "Front Of House";
  mobile_number: string | null;
  invited: boolean;
}

export type EmployeeFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  role: "Admin" | "Manager" | "Front Of House";
  mobile_number?: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      
      // Cast the data to ensure it matches the Employee type
      setEmployees(data as unknown as Employee[]);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Could not fetch employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (employeeId: string) => {
    setInviting(employeeId);
    try {
      const { data, error } = await supabase.rpc("create_invite_token", {
        employee_id: employeeId,
      });

      if (error) throw error;

      toast({
        title: "Invite Sent",
        description: "The invitation has been sent successfully.",
      });

      // Refresh employee list to update invited status
      fetchEmployees();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast({
        title: "Error",
        description: error.message || "Could not send invite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviting(null);
    }
  };

  const handleAddEmployee = async (values: EmployeeFormValues) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([{ 
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          role: values.role,
          mobile_number: values.mobile_number || null,
          invited: false 
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Employee Added",
        description: "The employee has been added successfully.",
      });

      fetchEmployees();
      return true;
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.message || "Could not add employee. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Table>
          <TableCaption>A list of your employees.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
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
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.role}</TableCell>
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
                      onClick={() => sendInvite(employee.id)}
                      disabled={inviting === employee.id}
                    >
                      {inviting === employee.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send Invite
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddEmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddEmployee}
      />
    </div>
  );
}
