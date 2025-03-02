
import { format, parse, addDays, addWeeks, getDay } from 'date-fns';

// Days of week mapping
export const DAYS_OF_WEEK: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

// Day order for sorting
export const DAY_ORDER = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7
};

// Function to find the next occurrence of a specific day of the week
export const findNextDayOccurrence = (startDate: Date, dayOfWeek: string): Date => {
  const dayNo = DAYS_OF_WEEK[dayOfWeek];
  const startDayNo = startDate.getDay();
  const daysToAdd = (dayNo + 7 - startDayNo) % 7;
  // If today is the target day, we still want the next occurrence, so add 7 if daysToAdd is 0
  const actualDaysToAdd = daysToAdd === 0 ? 7 : daysToAdd;
  const resultDate = new Date(startDate);
  resultDate.setDate(startDate.getDate() + actualDaysToAdd);
  return resultDate;
};

// Function to generate weeks options
export const generateWeeksOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: i === 0 ? '1 week' : `${i + 1} weeks`,
  }));
};
