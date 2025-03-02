import React, { useState, useEffect } from 'react';
import { Location, ShiftTemplate, ShiftTemplateMaster, StaffMember } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, addWeeks, isSameDay, getDay, addDays, isBefore, parse } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ShiftPreview } from './shift-preview';
import { supabase } from "@/integrations/supabase/client";

// Mapping from day names to day numbers (0-6, Sunday is 0)
const DAY_NAME_TO_NUMBER: Record<string, number> = {
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
  version: z.number().min(1, { message: 'Please select a version.' }),
  start_date: z.string({ required_error: 'Please select a start date.' }),
  num_weeks: z.number().min(1).max(8),
});

type FormValues = z.infer<typeof formSchema>;

interface PreviewShift {
  template_id: string;
  template_name?: string;
  date: Date;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  location_name?: string;
  employee_id: string | null;
  employee_name?: string;
  status: string;
  hasConflict: boolean;
}

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftTemplates: ShiftTemplate[];
  locations: Location[];
  staffMembers: StaffMember[];
  selectedLocationId: string | null;
  selectedDate: Date;
  onSuccess: () => void;
}

export function AddShiftDialog({
  open,
  onOpenChange,
  shiftTemplates,
  locations,
  staffMembers,
  selectedLocationId,
  selectedDate,
  onSuccess,
}: AddShiftDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewShifts, setPreviewShifts] = useState<PreviewShift[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [existingShifts, setExistingShifts] = useState<any[]>([]);
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [selectedLocationTemplates, setSelectedLocationTemplates] = useState<ShiftTemplate[]>([]);
  const [availableStartDates, setAvailableStartDates] = useState<{value: string, label: string}[]>([]);

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location_id: selectedLocationId || '',
      version: 1,
      start_date: '',
      num_weeks: 1,
    },
  });

  // Fetch template masters when dialog opens
  useEffect(() => {
    if (open) {
      fetchTemplateMasters();
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        location_id: selectedLocationId || '',
        version: 1,
        start_date: '',
        num_weeks: 1,
      });
      setShowPreview(false);
      setPreviewShifts([]);
      setSelectedLocationTemplates([]);
      setAvailableStartDates([]);
    }
  }, [open, form, selectedDate, selectedLocationId]);

  // Fetch template masters to get versions
  const fetchTemplateMasters = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          location_id,
          locations(name),
          version,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process the data to create ShiftTemplateMaster objects
      const masterMap = new Map<string, ShiftTemplateMaster[]>();
      
      data.forEach((item) => {
        const locationId = item.location_id;
        const version = item.version;
        const locationName = item.locations?.name || 'Unknown';
        const createdAt = item.created_at;
        
        // Create or update the entry
        if (!masterMap.has(locationId)) {
          masterMap.set(locationId, []);
        }
        
        const existingVersions = masterMap.get(locationId)!.map(m => m.version);
        if (!existingVersions.includes(version)) {
          masterMap.get(locationId)!.push({
            location_id: locationId,
            location_name: locationName,
            version: version,
            created_at: createdAt,
          });
        }
      });
      
      // Flatten the map to array and sort
      const mastersList: ShiftTemplateMaster[] = [];
      masterMap.forEach((versions) => {
        versions.sort((a, b) => b.version - a.version); // Sort versions descending
        mastersList.push(...versions);
      });
      
      // Sort by location name
      mastersList.sort((a, b) => a.location_name.localeCompare(b.location_name));
      
      setTemplateMasters(mastersList);
    } catch (error) {
      console.error('Error fetching template masters:', error);
      toast.error('Failed to load template versions');
    }
  };

  // Watch location_id and version changes to update templates
  useEffect(() => {
    const locationId = form.watch('location_id');
    const version = form.watch('version');
    
    if (locationId && version) {
      fetchLocationTemplates(locationId, version);
    }
  }, [form.watch('location_id'), form.watch('version')]);

  // Generate available start dates when templates change
  useEffect(() => {
    if (selectedLocationTemplates.length > 0) {
      const dates = generateStartDateOptions();
      setAvailableStartDates(dates);
      
      if (dates.length > 0) {
        form.setValue('start_date', dates[0].value);
      }
    }
  }, [selectedLocationTemplates]);

  // Fetch templates for selected location and version
  const fetchLocationTemplates = async (locationId: string, version: number) => {
    try {
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          *,
          locations(id, name),
          employees(id, first_name, last_name, role, email)
        `)
        .eq('location_id', locationId)
        .eq('version', version);
      
      if (error) {
        throw error;
      }
      
      setSelectedLocationTemplates(data as ShiftTemplate[] || []);
    } catch (error) {
      console.error('Error fetching location templates:', error);
      toast.error('Failed to load templates for selected location and version');
    }
  };

  // Get available versions for selected location
  const getAvailableVersions = () => {
    const locationId = form.watch('location_id');
    if (!locationId) return [];
    
    return templateMasters
      .filter(master => master.location_id === locationId)
      .map(master => master.version)
      .sort((a, b) => b - a); // Sort descending
  };

  // Get employee name from ID
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return null;
    const employee = staffMembers.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : null;
  };

  // Get location name from ID
  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.name : null;
  };

  // Find the next occurrence of a specific day of the week from a given date
  const findNextDayOccurrence = (fromDate: Date, dayOfWeek: string) => {
    const targetDay = DAY_NAME_TO_NUMBER[dayOfWeek];
    const currentDay = getDay(fromDate);
    
    // Calculate days to add
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Go to next week if target day has already passed this week
    }
    
    return addDays(fromDate, daysToAdd);
  };

  // Generate start date options only for the first day of the week from templates
  const generateStartDateOptions = () => {
    if (selectedLocationTemplates.length === 0) return [];
    
    // Get unique days of week from templates
    const daysOfWeek = [...new Set(selectedLocationTemplates.map(t => t.day_of_week))];
    if (daysOfWeek.length === 0) return [];
    
    // Sort days of week by DAY_ORDER
    daysOfWeek.sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
    
    // Get only the first day of the week from the templates
    const firstDay = daysOfWeek[0];
    
    const today = new Date();
    const options: {value: string, label: string}[] = [];
    
    // Find the next occurrence of the first day from today
    let currentDate = findNextDayOccurrence(today, firstDay);
    
    // Add the next 8 occurrences of this first day
    for (let i = 0; i < 8; i++) {
      options.push({
        value: format(currentDate, 'yyyy-MM-dd'),
        label: `${firstDay}, ${format(currentDate, 'dd MMM yyyy')}`
      });
      
      // Add 7 days to get to the next occurrence of this day
      currentDate = addDays(currentDate, 7);
    }
    
    return options;
  };

  // Check for conflicts with existing shifts
  const fetchExistingShifts = async (startDate: Date, numWeeks: number) => {
    const endDate = addWeeks(startDate, numWeeks);
    
    try {
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching existing shifts:', error);
      return [];
    }
  };

  // Generate preview shifts
  const generatePreview = async () => {
    const values = form.getValues();
    if (!values.location_id || !values.version || !values.start_date) return;
    
    setIsSubmitting(true);
    
    try {
      // Parse start date
      const startDate = parse(values.start_date, 'yyyy-MM-dd', new Date());
      const numWeeks = values.num_weeks;
      
      // Fetch existing shifts for the date range
      const existing = await fetchExistingShifts(startDate, numWeeks);
      setExistingShifts(existing);
      
      // Generate preview shifts
      const shifts: PreviewShift[] = [];
      const templates = selectedLocationTemplates;
      
      if (templates.length === 0) {
        toast.error('No templates found for selected location and version');
        setIsSubmitting(false);
        return;
      }
      
      // Process each template
      for (const template of templates) {
        // Find first occurrence of the template's day of week
        let currentDate = findNextDayOccurrence(startDate, template.day_of_week);
        const endDate = addWeeks(startDate, numWeeks);
        
        while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
          // Check for conflicts
          const hasConflict = existing.some(shift => 
            shift.date === format(currentDate, 'yyyy-MM-dd') && 
            shift.location_id === template.location_id &&
            ((shift.start_time <= template.start_time && shift.end_time > template.start_time) ||
             (shift.start_time >= template.start_time && shift.start_time < template.end_time))
          );
          
          shifts.push({
            template_id: template.id,
            template_name: template.name,
            date: currentDate,
            day_of_week: template.day_of_week,
            start_time: template.start_time,
            end_time: template.end_time,
            location_id: template.location_id,
            location_name: getLocationName(template.location_id),
            employee_id: template.employee_id,
            employee_name: getEmployeeName(template.employee_id),
            status: 'pending',
            hasConflict
          });
          
          // Move to next week
          currentDate = addDays(currentDate, 7);
        }
      }
      
      setPreviewShifts(shifts);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate shift preview');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle saving shifts
  const handleSaveShifts = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare shifts for saving
      const shiftsToSave = previewShifts.map(shift => ({
        name: shift.template_name || `${shift.day_of_week} Shift`,
        date: format(shift.date, 'yyyy-MM-dd'),
        start_time: shift.start_time,
        end_time: shift.end_time,
        location_id: shift.location_id,
        employee_id: shift.employee_id,
        status: 'pending'
      }));
      
      // Save shifts to database
      const { data, error } = await supabase
        .from('shifts')
        .insert(shiftsToSave)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast.success(`Successfully created ${shiftsToSave.length} shifts`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving shifts:', error);
      toast.error('Failed to save shifts');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default version when location changes
  useEffect(() => {
    const locationId = form.watch('location_id');
    if (locationId) {
      const versions = getAvailableVersions();
      if (versions.length > 0) {
        form.setValue('version', versions[0]); // Set to highest version
      }
    }
  }, [form.watch('location_id')]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={showPreview ? "sm:max-w-[1000px]" : "sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle>Add Shifts</DialogTitle>
          <DialogDescription>
            Create shifts based on templates. Select a location and version to apply shifts starting from the first day of the template.
          </DialogDescription>
        </DialogHeader>

        {!showPreview ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generatePreview)} className="space-y-4">
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No locations found
                          </div>
                        ) : (
                          locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))
                        )}
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
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={!form.watch('location_id')}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableVersions().length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No versions found for this location
                          </div>
                        ) : (
                          getAvailableVersions().map((version) => (
                            <SelectItem key={version} value={version.toString()}>
                              v{version}
                            </SelectItem>
                          ))
                        )}
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={availableStartDates.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableStartDates.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Select a location and version first
                          </div>
                        ) : (
                          availableStartDates.map((date) => (
                            <SelectItem key={date.value} value={date.value}>
                              {date.label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Weeks</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select number of weeks" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'week' : 'weeks'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.watch('location_id') || !form.watch('version') || !form.watch('start_date')}
                >
                  {isSubmitting ? 'Loading...' : 'Preview Shifts'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <ShiftPreview 
              shifts={previewShifts}
              onSave={handleSaveShifts}
              onBack={() => setShowPreview(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
