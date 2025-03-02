
import * as z from 'zod';

// Form schema for adding shifts
export const addShiftFormSchema = z.object({
  location_id: z.string().uuid({ message: 'Please select a location.' }),
  version: z.coerce.number().positive({ message: 'Please select a version.' }),
  start_date: z.string().min(1, { message: 'Please select a start date.' }),
  weeks: z.coerce.number().min(1).max(12),
});

export type AddShiftFormValues = z.infer<typeof addShiftFormSchema>;
