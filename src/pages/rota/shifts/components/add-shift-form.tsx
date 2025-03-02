
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Location, ShiftTemplate, ShiftTemplateMaster } from '../../shift-templates/types';
import { addShiftFormSchema, AddShiftFormValues } from './add-shift-form-schema';
import { findNextDayOccurrence, generateWeeksOptions } from '../utils/date-utils';
import { addWeeks } from 'date-fns';

interface AddShiftFormProps {
  locations: Location[];
  templates: ShiftTemplate[];
  templateMasters: ShiftTemplateMaster[];
  defaultLocationId?: string;
  defaultVersion?: number;
  onSubmit: (values: AddShiftFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: any;
  onLocationChange: (locationId: string) => void;
  onVersionChange: (version: number) => void;
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
  onVersionChange
}: AddShiftFormProps) {
  // Set up the form with react-hook-form and zod validation
  const form = useForm<AddShiftFormValues>({
    resolver: zodResolver(addShiftFormSchema),
    defaultValues: {
      location_id: defaultLocationId || '',
      version: defaultVersion || 0,
      start_date: '',
      weeks: 1,
    },
  });

  // Effect to update form defaults when defaultLocationId or defaultVersion change
  useEffect(() => {
    if (defaultLocationId) {
      form.setValue('location_id', defaultLocationId);
    }
  }, [defaultLocationId, form]);

  useEffect(() => {
    if (defaultVersion) {
      form.setValue('version', defaultVersion);
    }
  }, [defaultVersion, form]);

  // Function to generate start date options based on the loaded templates
  const generateStartDateOptions = (): { value: string; label: string }[] => {
    const locationId = form.getValues('location_id');
    if (!locationId || templates.length === 0) {
      return [];
    }

    const today = new Date();
    const options: { value: string; label: string }[] = [];

    // Find the first day of week in the template
    const sortedDays = [...templates]
      .sort((a, b) => {
        const dayOrderMap: Record<string, number> = {
          'Monday': 1,
          'Tuesday': 2,
          'Wednesday': 3,
          'Thursday': 4,
          'Friday': 5,
          'Saturday': 6,
          'Sunday': 7
        };
        return dayOrderMap[a.day_of_week] - dayOrderMap[b.day_of_week];
      })
      .map(t => t.day_of_week);

    if (sortedDays.length === 0) return [];

    // Get the first day of week from sorted templates
    const firstDayOfWeek = sortedDays[0];

    // Find the next 4 occurrences of the first day
    for (let i = 0; i < 4; i++) {
      const nextDate = findNextDayOccurrence(addWeeks(today, i), firstDayOfWeek);
      options.push({
        value: format(nextDate, 'yyyy-MM-dd'),
        label: `Next ${firstDayOfWeek} (${format(nextDate, 'MMM dd')})`,
      });
    }

    return options;
  };

  // Create a local handler for location changes
  const handleLocationChange = (value: string) => {
    form.setValue('location_id', value);
    onLocationChange(value);
  };

  // Create a local handler for version changes
  const handleVersionChange = (value: string) => {
    const versionNumber = Number(value);
    form.setValue('version', versionNumber);
    onVersionChange(versionNumber);
  };

  return (
    <ScrollArea className="h-[400px] w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="location_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select onValueChange={(value) => {
                  handleLocationChange(value);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-input">
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
                <FormLabel>Version</FormLabel>
                <Select onValueChange={(value) => {
                  handleVersionChange(value);
                }} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a version" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templateMasters
                      .filter(master => master.location_id === form.getValues('location_id'))
                      .sort((a, b) => b.version - a.version)
                      .map((master) => (
                        <SelectItem key={master.version} value={master.version.toString()}>
                          v{master.version}
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
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a start date" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {generateStartDateOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="weeks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Weeks</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of weeks" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {generateWeeksOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive mt-4">
          <p>
            <strong>Error!</strong> {error.message}
          </p>
        </div>
      )}
    </ScrollArea>
  );
}
