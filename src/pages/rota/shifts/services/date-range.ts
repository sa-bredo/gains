
import { format, parse, addDays, addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';

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
