
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '../AddTeamMemberDialog';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';

type HourlyRateFieldProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function HourlyRateField({ form }: HourlyRateFieldProps) {
  const { currencyCode } = useCurrencySettings();
  
  return (
    <FormField
      control={form.control}
      name="hourly_rate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Hourly Rate ({currencyCode})</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencyCode === 'GBP' ? '£' : currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : ''}
              </span>
              <Input 
                type="number" 
                placeholder="0.00" 
                step="0.01"
                className="pl-8"
                {...field} 
                value={field.value || ''} 
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
