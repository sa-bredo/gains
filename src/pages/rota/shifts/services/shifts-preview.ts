
import { format, addDays, addWeeks } from 'date-fns';
import { ShiftTemplate, Location } from '../../shift-templates/types';
import { ShiftPreviewItem } from '../components/shift-preview';
import { DAYS_OF_WEEK } from '../utils/date-utils';

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
    name: `${shift.day_of_week} Shift`,
    status: 'scheduled'
  }));
};
