
export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  address?: string;
  role: string;
  start_job_date: string;
  end_job_date?: string | null;
  hourly_rate?: number | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  created_at: string;
  invited?: boolean;
  isTerminated?: boolean;
  auth_id?: string;
  contract_signed?: boolean;
  contract_url?: string;
  insurance_url?: string;
  integrations?: {
    slack?: {
      slack_user_id: string;
      slack_username: string;
      slack_email: string;
      slack_connected: boolean;
      slack_connected_at: string;
    }
  } | null;
}

// Added status type to help with UI rendering
export type EmployeeStatus = 'active' | 'terminated' | 'invited' | 'pending';

export interface TeamMemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  address?: string;
  role: string;
  start_job_date: string;
  end_job_date?: string;
  hourly_rate?: number;
  date_of_birth?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'front_of_house', label: 'Front of House' },
  { value: 'founder', label: 'Founder' },
  { value: 'instructor', label: 'Instructor' }
];

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};
