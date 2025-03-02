
export interface Location {
  id: string;
  name: string;
  address?: string | null;
  created_at?: string | null;
}

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  // Other employee fields may be included
}

export interface ShiftTemplate {
  id: string;
  name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id?: string | null;
  notes?: string | null;
  created_at?: string | null;
  
  // Join fields from the Supabase query - make these optional since they are from joins
  locations?: Location;
  employees?: StaffMember | null;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];
