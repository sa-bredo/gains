
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { RolePermission, Resource } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RolePermissionTableProps {
  rolePermissions: RolePermission[];
  resources: Resource[];
  roles: string[];
  onPermissionChange: (update: { role: string; resource: string; permission: string; value: boolean }) => Promise<void>;
  isLoading: boolean;
}

export function RolePermissionTable({
  rolePermissions,
  resources,
  roles,
  onPermissionChange,
  isLoading,
}: RolePermissionTableProps) {
  const [updatingPermissions, setUpdatingPermissions] = useState<Record<string, boolean>>({});

  const handleToggle = async (role: string, resource: string, permission: string, currentValue: boolean) => {
    const key = `${role}-${resource}-${permission}`;
    setUpdatingPermissions(prev => ({ ...prev, [key]: true }));
    
    try {
      await onPermissionChange({
        role,
        resource,
        permission: permission as 'can_view' | 'can_edit' | 'can_create' | 'can_delete',
        value: !currentValue
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setUpdatingPermissions(prev => ({ ...prev, [key]: false }));
    }
  };

  const getPermissionState = (role: string, resource: string, permission: string) => {
    const permissionObj = rolePermissions.find(
      p => p.role === role && p.resource === resource
    );
    
    return permissionObj ? permissionObj[permission as keyof RolePermission] as boolean : false;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Resource</TableHead>
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
              {['View', 'Edit', 'Create', 'Delete'].map((action, index) => (
                <TableRow key={`${resource.id}-${action}`} className={index === 0 ? 'border-t-2' : ''}>
                  <TableCell className={index === 0 ? 'font-semibold' : 'pl-8'}>
                    {index === 0 ? (
                      <div>
                        <div>{resource.name}</div>
                        <div className="text-xs text-gray-500">{resource.description}</div>
                      </div>
                    ) : (
                      action
                    )}
                  </TableCell>
                  {roles.map(role => {
                    const permissionKey = `can_${action.toLowerCase()}`;
                    const isDisabled = (role === 'admin' || role === 'founder') && 
                                       (permissionKey === 'can_view' || 
                                        permissionKey === 'can_edit' || 
                                        permissionKey === 'can_create' || 
                                        permissionKey === 'can_delete');
                    
                    const toggleKey = `${role}-${resource.name}-${permissionKey}`;
                    const isUpdating = updatingPermissions[toggleKey] || false;
                    const value = getPermissionState(role, resource.name, permissionKey);
                    const tooltipText = isDisabled ? `${role} always has full permissions` : '';
                    
                    return (
                      <TableCell key={`${role}-${permissionKey}`} className="text-center">
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          <div className="flex justify-center" title={tooltipText}>
                            <Switch
                              checked={isDisabled ? true : value}
                              disabled={isDisabled}
                              onCheckedChange={() => 
                                !isDisabled && handleToggle(role, resource.name, permissionKey, value)
                              }
                            />
                          </div>
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
  );
}
