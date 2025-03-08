
import { supabase } from '@/integrations/supabase/client';
import { StaffMember } from '../../../shift-templates/types';

// Fetch staff members
export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .in('role', ['Manager', 'Front Of House', 'Instructor'])
    .order('first_name');
  
  if (error) {
    throw error;
  }
  
  return data || [];
};
