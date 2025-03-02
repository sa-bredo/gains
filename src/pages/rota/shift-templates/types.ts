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
  name?: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id?: string | null;
  notes?: string | null;
  created_at?: string | null;
  version: number;
  
  // Join fields from the Supabase query - make these optional since they are from joins
  locations?: Location;
  employees?: StaffMember | null;
}

export interface ShiftTemplateMaster {
  location_id: string;
  location_name: string;
  version: number;
  created_at: string;
}

export interface Shift {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location_id: string | null;
  employee_id: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  
  // Join fields
  locations?: Location | null;
  employees?: StaffMember | null;
}

export interface ShiftTemplateFormValues {
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id: string | null;
  name?: string;
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const; // Make this a readonly tuple for proper type checking

export type DayOfWeek = typeof DAYS_OF_WEEK[number]; // This creates a union type of all days
