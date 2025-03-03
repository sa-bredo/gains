
export interface Resource {
  id: string;
  name: string;
  description: string;
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role: string;
  resource: string;
  can_view: boolean;
  can_edit: boolean;
  can_create: boolean;
  can_delete: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PermissionUpdate = {
  role: string;
  resource: string;
  permission: 'can_view' | 'can_edit' | 'can_create' | 'can_delete';
  value: boolean;
};

export const AVAILABLE_ROLES = [
  'admin', 
  'manager', 
  'front_of_house', 
  'founder', 
  'instructor'
];
