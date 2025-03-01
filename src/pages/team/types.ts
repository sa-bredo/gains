
export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number?: string;
  address?: string;
  date_of_birth?: string;
  hourly_rate?: number;
  auth_id?: string;
  created_at?: string;
  invited?: boolean;
  avatar_url?: string;
  start_job_date?: string;
  end_job_date?: string;
  contract_signed?: boolean;
  contract_url?: string;
  insurance_url?: string;
}

export interface TeamMemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  mobile_number?: string;
  address?: string;
  date_of_birth?: string;
  hourly_rate?: number;
}

export type RoleOption = {
  value: string;
  label: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Front Of House", label: "Front Of House" }
];
