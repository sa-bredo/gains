
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Permission = {
  id: string;
  role: string;
  resource: string;
  can_view: boolean;
  can_edit: boolean;
  can_create: boolean;
  can_delete: boolean;
  active: boolean;
};

type Resource = {
  id: string;
  name: string;
  description: string;
};

type RolePermissionTableProps = {
  resources: Resource[];
  permissions: Permission[];
  role: string;
  onPermissionChange: (updatedPermission: Permission) => void;
};

export function RolePermissionTable({ resources, permissions, role, onPermissionChange }: RolePermissionTableProps) {
  const handlePermissionChange = async (permission: Permission, action: 'can_view' | 'can_edit' | 'can_create' | 'can_delete', value: boolean) => {
    try {
      const updatedPermission = { ...permission, [action]: value };
      
      const { error } = await supabase
        .from('role_permissions')
        .update({ [action]: value })
        .eq('id', permission.id);

      if (error) throw error;
      
      onPermissionChange(updatedPermission);
      toast.success(`Permission updated successfully`);
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Resource</TableHead>
          <TableHead className="text-center">View</TableHead>
          <TableHead className="text-center">Edit</TableHead>
          <TableHead className="text-center">Create</TableHead>
          <TableHead className="text-center">Delete</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map(resource => {
          const permission = permissions.find(p => p.resource === resource.name && p.role === role);
          
          return (
            <TableRow key={resource.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-sm text-muted-foreground">{resource.description}</div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {permission ? (
                  <Checkbox
                    checked={permission.can_view}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, 'can_view', !!checked)
                    }
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission ? (
                  <Checkbox
                    checked={permission.can_edit}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, 'can_edit', !!checked)
                    }
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission ? (
                  <Checkbox
                    checked={permission.can_create}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, 'can_create', !!checked)
                    }
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {permission ? (
                  <Checkbox
                    checked={permission.can_delete}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission, 'can_delete', !!checked)
                    }
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
