
export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  start_job_date: string;
  end_job_date?: string | null;
  hourly_rate?: number | null;
  avatar_url?: string | null;
  date_of_birth?: string | null;
  created_at: string;
  invited?: boolean;
  isTerminated?: boolean;
}

export interface TeamMemberFormValues {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
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
