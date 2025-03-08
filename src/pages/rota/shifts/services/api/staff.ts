
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '../../../shift-templates/types';

// Fetch staff members
export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
  console.log("Fetching staff members from Supabase");
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .in('role', ['Manager', 'Front Of House', 'Instructor', 'manager', 'front_of_house', 'instructor'])
    .order('first_name');
  
  if (error) {
    console.error("Error fetching staff members:", error);
    throw error;
  }
  
  console.log("Staff data received:", data);
  return data || [];
};
