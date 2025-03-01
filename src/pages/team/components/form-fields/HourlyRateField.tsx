
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '../AddTeamMemberDialog';

type HourlyRateFieldProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function HourlyRateField({ form }: HourlyRateFieldProps) {
  return (
    <FormField
      control={form.control}
      name="hourly_rate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Hourly Rate</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              placeholder="0.00" 
              step="0.01"
              {...field} 
              value={field.value || ''} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
