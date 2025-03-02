import { format, parse, addDays, addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
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
  console.log(`Fetching templates for location ${locationId} and version ${version}`);
  
  if (!locationId || isNaN(version)) {
    console.error('Invalid parameters:', { locationId, version });
    throw new Error('Invalid location ID or version');
  }

  const { data, error } = await supabase
    .from('shift_templates')
    .select(`
      *,
      employees:employee_id (id, first_name, last_name, role, email)
    `)
    .eq('location_id', locationId)
    .eq('version', version);

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  console.log('Templates fetched:', data);

  // Transform the data to ensure it matches the ShiftTemplate type
  const templates = data?.map(template => ({
    ...template,
    employees: template.employees ? {
      ...template.employees,
      // Ensure all required fields are present, using defaults if needed
      role: template.employees.role || '',
      email: template.employees.email || ''
    } : null
  })) || [];

  // Sort templates by day of week
  return templates.sort((a, b) => DAY_ORDER[a.day_of_week] - DAY_ORDER[b.day_of_week]);
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
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id: string | null;
  name: string;
  status: string;
}[]) => {
  console.log('Creating shifts with data:', shiftsToCreate);
  const { data, error } = await supabase
    .from('shifts')
    .insert(shiftsToCreate);

  if (error) {
    console.error('Error creating shifts:', error);
    throw error;
  }

  console.log('Shifts created successfully:', data);
  return { success: true };
};

// Fetch shifts with date range filter
export const fetchShiftsWithDateRange = async (
  startDate: Date | null,
  endDate: Date | null,
  locationId: string | null
) => {
  try {
    let query = supabase
      .from('shifts')
      .select(`
        *,
        locations:location_id (id, name),
        employees:employee_id (id, first_name, last_name, role, email)
      `)
      .order('date', { ascending: true });
    
    if (startDate && endDate) {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      console.log(`Filtering shifts between ${formattedStartDate} and ${formattedEndDate}`);
      
      query = query
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);
    } else if (startDate) {
      const formattedDate = format(startDate, 'yyyy-MM-dd');
      console.log(`Filtering shifts for date ${formattedDate}`);
      query = query.eq('date', formattedDate);
    }
    
    if (locationId) {
      console.log(`Filtering shifts for location ${locationId}`);
      query = query.eq('location_id', locationId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching shifts with date range:', error);
    throw error;
  }
};

// Get date range for preset
export const getDateRangeForPreset = (preset: string): { startDate: Date, endDate: Date } => {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today };
    
    case 'tomorrow':
      const tomorrow = addDays(today, 1);
      return { startDate: tomorrow, endDate: tomorrow };
    
    case 'thisWeek':
      return {
        startDate: startOfWeek(today, { weekStartsOn: 1 }),
        endDate: endOfWeek(today, { weekStartsOn: 1 })
      };
    
    case 'nextWeek':
      const nextWeek = addWeeks(today, 1);
      return {
        startDate: startOfWeek(nextWeek, { weekStartsOn: 1 }),
        endDate: endOfWeek(nextWeek, { weekStartsOn: 1 })
      };
    
    case 'lastWeek':
      const lastWeek = subWeeks(today, 1);
      return {
        startDate: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        endDate: endOfWeek(lastWeek, { weekStartsOn: 1 })
      };
    
    case 'thisMonth':
      return {
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      };
    
    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };
    
    default:
      return { startDate: today, endDate: today };
  }
};

// Generate shifts preview based on templates and date range
export const generateShiftsPreview = (
  templates: ShiftTemplate[], 
  startDate: Date, 
  weeks: number
): ShiftPreviewItem[] => {
  console.log('Generating shifts preview with:', {
    templates: templates.length,
    startDate: startDate.toISOString(),
    weeks
  });
  
  let shifts: ShiftPreviewItem[] = [];

  for (let i = 0; i < weeks; i++) {
    templates.forEach(template => {
      // Calculate the correct day in the week for this template
      const templateDayNo = DAYS_OF_WEEK[template.day_of_week];
      const startDayNo = startDate.getDay();
      const daysToAdd = (templateDayNo - startDayNo + 7) % 7;
      const shiftDate = addDays(addWeeks(startDate, i), daysToAdd);
      
      console.log('Creating shift for:', {
        template: template.day_of_week,
        templateDayNo,
        startDayNo,
        daysToAdd,
        date: format(shiftDate, 'yyyy-MM-dd')
      });

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
  
  console.log('Generated shifts:', shifts.length);
  return shifts;
};

// Convert shifts to preview format
export const mapShiftsToPreview = (
  shifts: ShiftPreviewItem[], 
  locations: Location[]
) => {
  console.log('Mapping shifts to preview:', shifts.length);
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
  console.log('Formatting shifts for creation:', shifts);
  return shifts.map(shift => ({
    date: shift.date,
    start_time: shift.start_time,
    end_time: shift.end_time,
    location_id: shift.location_id,
    employee_id: shift.employee_id,
    name: `${shift.day_of_week} Shift`, // We still use day_of_week for the name
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
