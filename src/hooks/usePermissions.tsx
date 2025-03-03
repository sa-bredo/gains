
import { useAuth, UserRole } from "@/contexts/AuthContext";

type PermissionCheck = {
  canView: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isFrontOfHouse: boolean;
};

// Define permission rules for each role and resource
const permissionRules = {
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

export function usePermissions(): PermissionCheck {
  const { userRole } = useAuth();
  
  const hasPermission = (action: 'view' | 'edit' | 'create' | 'delete', resource: string): boolean => {
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
