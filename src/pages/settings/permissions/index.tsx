import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Resource, RolePermission, AVAILABLE_ROLES } from "./types";
import { RolePermissionTable } from "./components/role-permission-table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PermissionsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { canView } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!canView('config')) {
      toast.error('You do not have permission to access this page');
      navigate('/');
    }
  }, [canView, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('name');

      if (resourcesError) throw resourcesError;
      
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role')
        .order('resource');

      if (permissionsError) throw permissionsError;

      setResources(resourcesData as Resource[]);
      setRolePermissions(permissionsData as RolePermission[]);

      const existingRoleResourcePairs = permissionsData.map(
        (p: RolePermission) => `${p.role}-${p.resource}`
      );

      const missingPermissions = [];
      for (const role of AVAILABLE_ROLES) {
        for (const resource of resourcesData) {
          const pair = `${role}-${resource.name}`;
          if (!existingRoleResourcePairs.includes(pair)) {
            missingPermissions.push({
              role,
              resource: resource.name,
              can_view: role === 'admin' || role === 'founder',
              can_edit: role === 'admin' || role === 'founder',
              can_create: role === 'admin' || role === 'founder',
              can_delete: role === 'admin' || role === 'founder',
              active: true
            });
          }
        }
      }

      if (missingPermissions.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(missingPermissions);

        if (insertError) {
          console.error('Error inserting missing permissions:', insertError);
        } else {
          const { data: refreshedData, error: refreshError } = await supabase
            .from('role_permissions')
            .select('*')
            .order('role')
            .order('resource');

          if (!refreshError && refreshedData) {
            setRolePermissions(refreshedData as RolePermission[]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load permissions data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePermissionChange = async ({ role, resource, permission, value }: { 
    role: string; 
    resource: string; 
    permission: string; 
    value: boolean 
  }) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .update({ [permission]: value })
        .eq('role', role)
        .eq('resource', resource);

      if (error) throw error;
      
      setRolePermissions(prev => 
        prev.map(p => 
          p.role === role && p.resource === resource
            ? { ...p, [permission]: value }
            : p
        )
      );
      
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Manage what different user roles can access
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>
              Configure which roles have permissions to view, edit, create, and delete resources.
              Use the toggles to grant or revoke permissions for each action.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <RolePermissionTable
                rolePermissions={rolePermissions}
                resources={resources}
                roles={AVAILABLE_ROLES}
                onPermissionChange={handlePermissionChange}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
