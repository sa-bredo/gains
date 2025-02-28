
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { EmployeesTable } from "./components/employees-table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEmployeeDialog } from "./components/add-employee-dialog";

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number: string | null;
  invited: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("last_name", { ascending: true });

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInvite = async (employeeId: string) => {
    try {
      const { data, error } = await supabase.rpc('create_invite_token', {
        employee_id: employeeId
      });

      if (error) throw error;

      // Update the local state to reflect the invitation
      setEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId ? { ...emp, invited: true } : emp
        )
      );

      toast({
        title: "Success",
        description: "Invitation sent successfully!",
      });

      // In a real application, you would also send an email with the token
      console.log("Invitation token:", data);

    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddEmployee = async (employee: Omit<Employee, 'id' | 'invited'>) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([{ ...employee, invited: false }])
        .select();

      if (error) throw error;

      setEmployees(prev => [...prev, data[0] as Employee]);
      
      toast({
        title: "Success",
        description: "Employee added successfully!",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <motion.header 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out"
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Employee Management</span>
            </div>
          </motion.header>
          
          <motion.div 
            className="p-6"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
                  <p className="text-muted-foreground">
                    Manage your team members and their access roles
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchEmployees}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>
              <Separator />
              <EmployeesTable 
                employees={employees} 
                loading={loading}
                onInvite={handleInvite}
              />
            </div>
          </motion.div>
        </SidebarInset>
      </div>
      <AddEmployeeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleAddEmployee}
      />
    </SidebarProvider>
  );
}
