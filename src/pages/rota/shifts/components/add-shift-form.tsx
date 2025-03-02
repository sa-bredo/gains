import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Location, ShiftTemplate, ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { DAY_ORDER } from '../utils/date-utils';
import { cn } from '@/lib/utils';
import { AddShiftFormValues, addShiftFormSchema } from './add-shift-form-schema';
import { DialogErrorDetails } from '@/components/ui/dialog';

export interface AddShiftFormProps {
  locations: Location[];
  templates: ShiftTemplate[];
  templateMasters: ShiftTemplateMaster[];
  defaultLocationId?: string;
  defaultVersion?: number; 
  onSubmit: (values: AddShiftFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: any;
  onLocationChange: (locationId: string) => Promise<void>;
  onVersionChange: (version: number) => Promise<void>;
  onAddComplete?: () => void; // Added this prop to match what's being passed in index.tsx
}

export function AddShiftForm({ 
  locations, 
  templates, 
  templateMasters,
  defaultLocationId,
  defaultVersion,
  onSubmit,
  onCancel,
  isLoading,
  error,
  onLocationChange,
  onVersionChange,
  onAddComplete
}: AddShiftFormProps) {
  const [availableVersions, setAvailableVersions] = useState<{label: string, value: number}[]>([]);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  // Form setup
  const form = useForm<AddShiftFormValues>({
    resolver: zodResolver(addShiftFormSchema),
    defaultValues: {
      location_id: defaultLocationId || '',
      version: defaultVersion || 1,
      start_date: '',
      weeks: 1
    },
  });

  // When locations or templateMasters change, update available versions
  useEffect(() => {
    if (form.getValues('location_id')) {
      updateAvailableVersions(form.getValues('location_id'));
    }
  }, [locations, templateMasters]);

  // Watch for location changes to update versions
  const watchedLocationId = form.watch('location_id');
  useEffect(() => {
    if (watchedLocationId) {
      updateAvailableVersions(watchedLocationId);
      onLocationChange(watchedLocationId);
    }
  }, [watchedLocationId]);

  // Watch for version changes to update available dates
  const watchedVersion = form.watch('version');
  useEffect(() => {
    if (watchedVersion && watchedLocationId) {
      onVersionChange(watchedVersion);
    }
  }, [watchedVersion, watchedLocationId]);

  // Update available dates when templates change
  useEffect(() => {
    updateAvailableDates();
  }, [templates]);

  // Function to update available versions when location changes
  const updateAvailableVersions = (locationId: string) => {
    const versions = templateMasters
      .filter(tm => tm.location_id === locationId)
      .map(tm => ({
        label: `Version ${tm.version}`,
        value: tm.version
      }))
      .sort((a, b) => b.value - a.value); // Sort in descending order
    
    setAvailableVersions(versions);
    
    // If no version is selected or current version isn't available, select the latest
    if (versions.length > 0 && (!form.getValues('version') || !versions.some(v => v.value === form.getValues('version')))) {
      form.setValue('version', versions[0].value);
    }
  };

  // Find the first day of week in templates
  const findFirstDayOfWeek = (): string | null => {
    if (!templates.length) return null;
    
    // Sort templates by day of week
    const sortedTemplates = [...templates].sort(
      (a, b) => DAY_ORDER[a.day_of_week] - DAY_ORDER[b.day_of_week]
    );
    
    // Return the day of week of the first template
    return sortedTemplates[0]?.day_of_week || null;
  };

  // Update available dates based on the first day of the week in templates
  const updateAvailableDates = () => {
    const firstDayOfWeek = findFirstDayOfWeek();
    if (!firstDayOfWeek) {
      setAvailableDates([]);
      return;
    }
    
    // Get day number (0-6) for the first day in template
    const dayNumber = DAY_ORDER[firstDayOfWeek] || 0;
    
    // Generate dates for the next 12 weeks (3 months)
    const dates: Date[] = [];
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    // Find the upcoming matching day
    let daysUntilTarget = (dayNumber - startOfDay.getDay() + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7; // If today is the target day, go to next week
    
    let currentDate = new Date(startOfDay);
    currentDate.setDate(currentDate.getDate() + daysUntilTarget);
    
    // Add 12 weekly options
    for (let i = 0; i < 12; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    setAvailableDates(dates);
    
    // If we have dates and no date is selected, select the first one
    if (dates.length > 0 && !form.getValues('start_date')) {
      form.setValue('start_date', format(dates[0], 'yyyy-MM-dd'));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="location_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Version</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
                disabled={isLoading || availableVersions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableVersions.map((version) => (
                    <SelectItem key={version.value} value={version.value.toString()}>
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading || availableDates.length === 0}
                    >
                      {field.value ? (
                        format(
                          parse(field.value, 'yyyy-MM-dd', new Date()), 
                          'EEE, MMM d, yyyy'
                        )
                      ) : (
                        <span>Select a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                    onSelect={(date) => date && field.onChange(format(date, 'yyyy-MM-dd'))}
                    disabled={date => !availableDates.some(d => 
                      d.getFullYear() === date.getFullYear() && 
                      d.getMonth() === date.getMonth() && 
                      d.getDate() === date.getDate()
                    )}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weeks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Weeks</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(Number(e.target.value))}
                  min={1} 
                  max={12} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <DialogErrorDetails 
            errorDetails={error.message || JSON.stringify(error, null, 2)} 
          />
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Generating..." : "Preview Shifts"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
