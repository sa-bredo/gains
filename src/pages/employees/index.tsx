import React, { useEffect, useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { supabaseClient } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddEmployeeDialog } from "./components/add-employee-dialog";
import { EmployeesTable } from "./components/employees-table";

// Define and export the Employee type
export type Employee = Tables<"employees"> & {
  invited: boolean;
};

// Define the EmployeeFormValues type for the add dialog
export type EmployeeFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  role: "Front Of House" | "Manager" | "Admin";
  mobile_number?: string;
};

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from("employees")
        .select("*");

      if (error) {
        console.error("Error fetching employees:", error);
        toast({
          title: "Error fetching employees",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      }

      if (data) {
        const employeesWithInvitedStatus = await Promise.all(
          data.map(async (employee) => {
            const { data: inviteData, error: inviteError } = await supabaseClient
              .from("employee_invites")
              .select("*")
              .eq("employee_id", employee.id)
              .single();

            if (inviteError && inviteError.message.includes('No rows found')) {
              return { ...employee, invited: false };
            }

            return { ...employee, invited: !!inviteData };
          })
        );
        setEmployees(employeesWithInvitedStatus as Employee[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
  };

  const handleInviteEmployee = async (employeeId: string) => {
    try {
      const { data, error } = await supabaseClient.functions.invoke(
        "create_invite_token",
        {
          body: { employee_id: employeeId },
        }
      );

      if (error) {
        console.error("Error creating invite:", error);
        toast({
          title: "Error creating invite",
          description: "Failed to create invite. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data && data.token) {
        const inviteLink = `${window.location.origin}/accept-invite?token=${data.token}`;

        const sendInvite = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: employees.find((e) => e.id === employeeId)?.email,
            inviteLink: inviteLink,
          }),
        });

        if (!sendInvite.ok) {
          console.error("Error sending invite email");
          toast({
            title: "Error sending invite",
            description: "Failed to send invite email. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Optimistically update the invited status
        setEmployees((prevEmployees) =>
          prevEmployees.map((employee) =>
            employee.id === employeeId ? { ...employee, invited: true } : employee
          )
        );

        toast({
          title: "Invite sent",
          description: `Invite sent successfully to ${
            employees.find((e) => e.id === employeeId)?.email
          }`,
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Employees</h1>
        <AddEmployeeDialog onEmployeeAdded={handleEmployeeAdded} />
      </div>
      <div className="mt-4">
        <EmployeesTable
          employees={employees}
          loading={loading}
          onInvite={handleInviteEmployee}
        />
      </div>
    </div>
  );
};

export default EmployeesPage;
