
import { format, parse, addDays, addWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Location, ShiftTemplate, ShiftTemplateMaster, StaffMember } from '../../shift-templates/types';
import { DAY_ORDER } from '../utils/date-utils';
import { ShiftPreviewItem } from '../components/shift-preview';

// Fetch locations from Supabase
export const fetchLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
};

// Fetch template masters from Supabase
export const fetchTemplateMasters = async (): Promise<ShiftTemplateMaster[]> => {
  const { data, error } = await supabase
    .from('shift_templates')
    .select('location_id, version, locations:location_id(name)')
    .order('location_id')
    .order('version', { ascending: false });

  if (error) {
    throw error;
  }

  // Process the data to get unique location_id, version combinations
  const mastersMap = new Map();
  data?.forEach(item => {
    const key = `${item.location_id}-${item.version}`;
    if (!mastersMap.has(key)) {
      mastersMap.set(key, {
        location_id: item.location_id,
        version: item.version,
        location_name: item.locations?.name,
        created_at: '' // This field might not be available
      });
    }
  });
  
  return Array.from(mastersMap.values()) as ShiftTemplateMaster[];
};

// Fetch templates for a specific location and version
export const fetchTemplatesForLocationAndVersion = async (
  locationId: string, 
  version: number
): Promise<ShiftTemplate[]> => {
  const { data, error } = await supabase
    .from('shift_templates')
    .select(`
      *,
      employees:employee_id (id, first_name, last_name, role, email)
    `)
    .eq('location_id', locationId)
    .eq('version', version);

  if (error) {
    throw error;
  }

  // Sort templates by day of week
  return data?.sort((a, b) => DAY_ORDER[a.day_of_week] - DAY_ORDER[b.day_of_week]) || [];
};

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

// Create shifts in Supabase
export const createShifts = async (shiftsToCreate: {
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id: string | null;
  name: string;
  status: string;
}[]) => {
  const { error } = await supabase
    .from('shifts')
    .insert(shiftsToCreate);

  if (error) {
    throw error;
  }

  return { success: true };
};

// Generate shifts preview based on templates and date range
export const generateShiftsPreview = (
  templates: ShiftTemplate[], 
  startDate: Date, 
  weeks: number
): ShiftPreviewItem[] => {
  let shifts: ShiftPreviewItem[] = [];

  for (let i = 0; i < weeks; i++) {
    templates.forEach(template => {
      // Calculate the correct day in the week for this template
      const templateDayNo = DAYS_OF_WEEK[template.day_of_week];
      const startDayNo = startDate.getDay();
      const daysToAdd = (templateDayNo - startDayNo + 7) % 7;
      const shiftDate = addDays(addWeeks(startDate, i), daysToAdd);

      shifts.push({
        date: format(shiftDate, 'yyyy-MM-dd'),
        day_of_week: template.day_of_week,
        start_time: template.start_time,
        end_time: template.end_time,
        location_id: template.location_id,
        employee_id: template.employee_id,
        employee_name: template.employees ? 
          `${template.employees.first_name} ${template.employees.last_name}` : '',
        version: template.version,
      });
    });
  }

  return shifts;
};

// Convert shifts to preview format
export const mapShiftsToPreview = (
  shifts: ShiftPreviewItem[], 
  locations: Location[]
) => {
  return shifts.map(shift => {
    const locationName = locations.find(loc => loc.id === shift.location_id)?.name || '';
    
    return {
      template_id: '',
      template_name: '',
      date: new Date(shift.date),
      day_of_week: shift.day_of_week,
      start_time: shift.start_time,
      end_time: shift.end_time,
      location_id: shift.location_id,
      location_name: locationName,
      employee_id: shift.employee_id,
      employee_name: shift.employee_name || 'Unassigned',
      status: 'new',
      hasConflict: false
    };
  });
};

// Format shifts for database insertion
export const formatShiftsForCreation = (shifts: ShiftPreviewItem[]) => {
  return shifts.map(shift => ({
    date: shift.date,
    day_of_week: shift.day_of_week,
    start_time: shift.start_time,
    end_time: shift.end_time,
    location_id: shift.location_id,
    employee_id: shift.employee_id,
    name: `${shift.day_of_week} Shift`, // Adding a default name
    status: 'scheduled' // Adding a default status
  }));
};

// Days of week mapping (imported from date-utils, but reexported for convenience)
export const DAYS_OF_WEEK: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};
