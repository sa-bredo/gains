
import { useEffect, useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type PermissionAction = 'view' | 'edit' | 'create' | 'delete';

type PermissionCheck = {
  canView: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isFrontOfHouse: boolean;
};

// Define types for database permission records
type ResourcePermission = {
  id: string;
  role: string;
  resource: string;
  can_view: boolean;
  can_edit: boolean;
  can_create: boolean;
  can_delete: boolean;
  active: boolean;
}

// Fallback permission rules in case DB fetch fails
const fallbackPermissionRules = {
  admin: {
    view: ['*'],
    edit: ['*'],
    create: ['*'],
    delete: ['*']
  },
  manager: {
    view: ['*'],
    edit: ['locations', 'shifts', 'employees', 'templates'],
    create: ['locations', 'shifts', 'employees', 'templates'],
    delete: ['shifts', 'templates']
  },
  front_of_house: {
    view: ['shifts', 'templates'],
    edit: [],
    create: [],
    delete: []
  },
  founder: {
    view: ['*'],
    edit: ['*'],
    create: ['*'],
    delete: ['*']
  },
  instructor: {
    view: ['shifts', 'templates'],
    edit: [],
    create: [],
    delete: []
  }
};

type PermissionRules = {
  [key in UserRole]?: {
    [key in PermissionAction]: string[];
  };
};

export function usePermissions(): PermissionCheck {
  const { userRole } = useAuth();
  const [permissionRules, setPermissionRules] = useState<PermissionRules>(fallbackPermissionRules);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data, error } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('active', true);

        if (error) {
          console.error('Error fetching permissions:', error);
          return;
        }

        if (data && data.length > 0) {
          // Transform the flat DB records into our permission rules structure
          const dbPermissions: PermissionRules = {};
          
          data.forEach((item: ResourcePermission) => {
            if (!dbPermissions[item.role as UserRole]) {
              dbPermissions[item.role as UserRole] = {
                view: [],
                edit: [],
                create: [],
                delete: []
              };
            }
            
            if (item.can_view) dbPermissions[item.role as UserRole].view.push(item.resource);
            if (item.can_edit) dbPermissions[item.role as UserRole].edit.push(item.resource);
            if (item.can_create) dbPermissions[item.role as UserRole].create.push(item.resource);
            if (item.can_delete) dbPermissions[item.role as UserRole].delete.push(item.resource);
          });

          // Add wildcard permissions for admin and founder
          if (dbPermissions.admin) {
            dbPermissions.admin.view = ['*'];
            dbPermissions.admin.edit = ['*'];
            dbPermissions.admin.create = ['*'];
            dbPermissions.admin.delete = ['*'];
          }
          
          if (dbPermissions.founder) {
            dbPermissions.founder.view = ['*'];
            dbPermissions.founder.edit = ['*'];
            dbPermissions.founder.create = ['*'];
            dbPermissions.founder.delete = ['*'];
          }

          setPermissionRules(dbPermissions);
        }
      } catch (error) {
        console.error('Unexpected error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, []);
  
  const hasPermission = (action: PermissionAction, resource: string): boolean => {
    if (!userRole) return false;
    
    const rolePermissions = permissionRules[userRole] || { view: [], edit: [], create: [], delete: [] };
    return rolePermissions[action].includes('*') || rolePermissions[action].includes(resource);
  };
  
  return {
    canView: (resource: string) => hasPermission('view', resource),
    canEdit: (resource: string) => hasPermission('edit', resource),
    canCreate: (resource: string) => hasPermission('create', resource),
    canDelete: (resource: string) => hasPermission('delete', resource),
    isAdmin: userRole === 'admin',
    isManager: userRole === 'manager',
    isFrontOfHouse: userRole === 'front_of_house'
  };
}
