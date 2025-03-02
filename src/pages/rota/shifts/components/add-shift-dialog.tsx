
import React, { useState, useEffect } from 'react';
import { Location, ShiftTemplate, ShiftTemplateMaster, StaffMember } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format, parse, addDays, addWeeks, isAfter, isBefore, getDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShiftPreview } from './shift-preview';

export interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComplete?: () => void;
  defaultLocationId?: string;
  defaultVersion?: number;
}

// Days of week mapping
const DAYS_OF_WEEK: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

// Day order for sorting
const DAY_ORDER = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 7
};

// Form schema
const formSchema = z.object({
  location_id: z.string().uuid({ message: 'Please select a location.' }),
  version: z.coerce.number().positive({ message: 'Please select a version.' }),
  start_date: z.string().min(1, { message: 'Please select a start date.' }),
  weeks: z.coerce.number().min(1).max(12),
});

// Function to generate weeks options
const weeksOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: i === 0 ? '1 week' : `${i + 1} weeks`,
}));

export function AddShiftDialog({ 
  open, 
  onOpenChange, 
  onAddComplete,
  defaultLocationId,
  defaultVersion
}: AddShiftDialogProps) {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [generatedShifts, setGeneratedShifts] = useState<ShiftPreview[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<any>(null);

  // Set up the form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_id: defaultLocationId || '',
      version: defaultVersion || 0,
      start_date: '',
      weeks: 1,
    },
  });

  // Fetch locations from Supabase
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  // Fetch template masters from Supabase
  const fetchTemplateMasters = async () => {
    try {
      // Get template masters from view or joined query since shift_template_masters table doesn't exist directly
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
      
      const processedMasters = Array.from(mastersMap.values()) as ShiftTemplateMaster[];
      setTemplateMasters(processedMasters);
    } catch (error) {
      console.error("Error fetching template masters:", error);
      toast({
        title: "Failed to load template masters",
        description: "There was a problem loading the template masters data.",
        variant: "destructive",
      });
    }
  };

  const fetchTemplates = async (locationId: string, version: number) => {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('location_id', locationId)
        .eq('version', version);

      if (error) {
        throw error;
      }

      // Sort templates by day of week
      const sortedTemplates = data?.sort((a, b) => DAY_ORDER[a.day_of_week] - DAY_ORDER[b.day_of_week]) || [];
      setTemplates(sortedTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Failed to load templates",
        description: "There was a problem loading the shift templates data.",
        variant: "destructive",
      });
    }
  };

  // Load initial data
  useEffect(() => {
    fetchLocations();
    fetchTemplateMasters();
  }, []);

  // Effect to update form defaults when defaultLocationId or defaultVersion change
  useEffect(() => {
    if (defaultLocationId) {
      form.setValue('location_id', defaultLocationId);
      // Trigger location change to fetch templates
      handleLocationChange(defaultLocationId);
    }
  }, [defaultLocationId, form]);

  useEffect(() => {
    if (defaultVersion) {
      form.setValue('version', defaultVersion);
      // If we also have a location ID, fetch templates for this version
      const locationId = form.getValues('location_id');
      if (locationId) {
        fetchTemplates(locationId, defaultVersion);
      }
    }
  }, [defaultVersion, form]);

  // Function to find the next occurrence of a specific day of the week
  const findNextDayOccurrence = (startDate: Date, dayOfWeek: string): Date => {
    const dayNo = DAYS_OF_WEEK[dayOfWeek];
    const startDayNo = startDate.getDay();
    const daysToAdd = (dayNo + 7 - startDayNo) % 7;
    const resultDate = new Date(startDate);
    resultDate.setDate(startDate.getDate() + daysToAdd);
    return resultDate;
  };

  // Function to generate start date options based on the selected location
  const generateStartDateOptions = (): { value: string; label: string }[] => {
    const locationId = form.getValues('location_id');
    if (!locationId) {
      return [];
    }

    const today = new Date();
    const options: { value: string; label: string }[] = [];

    // Generate options for each day of the week in the next 7 days
    Object.keys(DAYS_OF_WEEK).forEach(dayOfWeek => {
      const nextOccurrence = findNextDayOccurrence(today, dayOfWeek);
      options.push({
        value: format(nextOccurrence, 'yyyy-MM-dd'),
        label: `Next ${dayOfWeek} (${format(nextOccurrence, 'MMM dd')})`,
      });
    });

    return options;
  };

  // Handle location change
  const handleLocationChange = (locationId: string) => {
    if (locationId) {
      // Find the latest version for the selected location
      const locationTemplates = templateMasters.filter(master => master.location_id === locationId);
      const latestVersion = locationTemplates.length > 0 
        ? Math.max(...locationTemplates.map(t => t.version))
        : 1;
        
      form.setValue('version', latestVersion);
      fetchTemplates(locationId, latestVersion);
    }
  };

  // Handle version change
  const handleVersionChange = (version: number) => {
    const locationId = form.getValues('location_id');
    if (locationId) {
      fetchTemplates(locationId, version);
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setError(null);
    setIsGenerating(true);
    try {
      const startDate = parse(values.start_date, 'yyyy-MM-dd', new Date());
      const weeks = values.weeks;

      let shifts: ShiftPreview[] = [];

      for (let i = 0; i < weeks; i++) {
        templates.forEach(template => {
          const shiftDate = addWeeks(findNextDayOccurrence(startDate, template.day_of_week), i);
          shifts.push({
            date: format(shiftDate, 'yyyy-MM-dd'),
            day_of_week: template.day_of_week,
            start_time: template.start_time,
            end_time: template.end_time,
            location_id: template.location_id,
            employee_id: template.employee_id,
            version: template.version,
          });
        });
      }

      setGeneratedShifts(shifts);
    } catch (e: any) {
      console.error("Error generating shifts:", e);
      setError(e);
      toast({
        title: "Failed to generate shifts",
        description: "There was a problem generating the shifts.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to create shifts in Supabase
  const createShifts = async () => {
    setIsCreating(true);
    try {
      // Map ShiftPreview objects to the format expected by the shifts table
      const shiftsToCreate = generatedShifts.map(shift => ({
        date: shift.date,
        day_of_week: shift.day_of_week,
        start_time: shift.start_time,
        end_time: shift.end_time,
        location_id: shift.location_id,
        employee_id: shift.employee_id,
        name: `${shift.day_of_week} Shift`, // Adding a default name
        status: 'scheduled' // Adding a default status
      }));

      const { error } = await supabase
        .from('shifts')
        .insert(shiftsToCreate);

      if (error) {
        throw error;
      }

      toast({
        title: "Shifts created successfully",
        description: "The shifts have been created successfully.",
      });
      onOpenChange(false);
      setGeneratedShifts([]);
      if (onAddComplete) {
        onAddComplete();
      }
    } catch (e: any) {
      console.error("Error creating shifts:", e);
      setError(e);
      toast({
        title: "Failed to create shifts",
        description: "There was a problem creating the shifts.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Shifts</DialogTitle>
          <DialogDescription>
            Generate shifts based on a shift template.
          </DialogDescription>
        </DialogHeader>
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
                      field.onChange(value);
                      handleLocationChange(value);
                    }} defaultValue={field.value}>
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
                    <FormLabel>Version</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(Number(value));
                      handleVersionChange(Number(value));
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
                    <FormLabel>Weeks</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of weeks" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weeksOptions.map((option) => (
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
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Shifts"}
              </Button>
            </form>
          </Form>
          <Separator className="my-4" />
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              <p>
                <strong>Error!</strong> {error.message}
              </p>
            </div>
          )}
          {generatedShifts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Shift Preview</h3>
              <p className="text-sm text-muted-foreground">
                Here is a preview of the shifts that will be created.
              </p>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {generatedShifts.map((shift, index) => (
                  <div 
                    key={index} 
                    className="rounded-lg border p-3 shadow-sm"
                  >
                    <div className="font-medium">{shift.day_of_week}</div>
                    <div className="text-sm text-muted-foreground">{shift.date}</div>
                    <div className="text-sm">
                      {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={createShifts} disabled={isCreating || generatedShifts.length === 0}>
            {isCreating ? "Creating..." : "Create Shifts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
