
import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";

type Resource = {
  id: string;
  name: string;
  description: string;
};

type RolePermission = {
  id: string;
  role: string;
  resource: string;
  can_view: boolean;
  can_edit: boolean;
  can_create: boolean;
  can_delete: boolean;
  active: boolean;
};

export default function PermissionsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch resources
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select('*');

        if (resourcesError) throw resourcesError;
        setResources(resourcesData || []);

        // Fetch permissions
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('*');

        if (permissionsError) throw permissionsError;
        setRolePermissions(permissionsData || []);

        // Extract unique roles
        const uniqueRoles = [...new Set(permissionsData?.map(p => p.role) || [])];
        setRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load permissions data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const handlePermissionChange = async (permission: RolePermission, action: 'can_view' | 'can_edit' | 'can_create' | 'can_delete', value: boolean) => {
    try {
      const updatedPermission = { ...permission, [action]: value };
      
      const { error } = await supabase
        .from('role_permissions')
        .update({ [action]: value })
        .eq('id', permission.id);

      if (error) throw error;

      setRolePermissions(prev => 
        prev.map(p => p.id === permission.id ? updatedPermission : p)
      );
      
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <Separator orientation="vertical" className="h-4" />
              <span className="font-medium">Settings / Permissions</span>
            </div>
          </header>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Role Permissions</h1>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/5">Resource</TableHead>
                      {roles.map(role => (
                        <TableHead key={role} className="text-center">
                          {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map(resource => (
                      <React.Fragment key={resource.id}>
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={roles.length + 1} className="font-medium">
                            {resource.name} - {resource.description}
                          </TableCell>
                        </TableRow>
                        {['view', 'edit', 'create', 'delete'].map(action => (
                          <TableRow key={`${resource.id}-${action}`}>
                            <TableCell className="pl-8 capitalize">{action}</TableCell>
                            {roles.map(role => {
                              const permission = rolePermissions.find(
                                p => p.role === role && p.resource === resource.name
                              );
                              
                              return (
                                <TableCell key={`${role}-${action}`} className="text-center">
                                  {permission ? (
                                    <Checkbox
                                      checked={permission[`can_${action}` as keyof RolePermission] as boolean}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(
                                          permission, 
                                          `can_${action}` as 'can_view' | 'can_edit' | 'can_create' | 'can_delete',
                                          !!checked
                                        )
                                      }
                                    />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
