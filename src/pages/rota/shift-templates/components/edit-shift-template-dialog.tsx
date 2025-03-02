
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ShiftTemplate } from '../types';
import { useTeamMembers } from '@/pages/team/hooks/useTeamMembers';
import { TeamMember } from '@/pages/team/types';

const FormSchema = z.object({
  dayOfWeek: z.string({
    required_error: "Please select a day of the week",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  endTime: z.string({
    required_error: "Please select an end time",
  }),
  locationId: z.string({
    required_error: "Please select a location",
  }),
  employeeId: z.string().optional(),
  notes: z.string().optional(),
});

interface EditShiftTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
  template: ShiftTemplate;
  locations: { id: string; name: string }[];
}

export function EditShiftTemplateDialog({
  open,
  onOpenChange,
  onUpdate,
  template,
  locations,
}: EditShiftTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStaff, setActiveStaff] = useState<TeamMember[]>([]);
  const { fetchActiveStaff } = useTeamMembers();
  
  useEffect(() => {
    const getActiveStaff = async () => {
      const staff = await fetchActiveStaff();
      setActiveStaff(staff);
    };
    
    if (open) {
      getActiveStaff();
    }
  }, [open, fetchActiveStaff]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dayOfWeek: template.day_of_week,
      startTime: template.start_time,
      endTime: template.end_time,
      locationId: template.location_id,
      employeeId: template.employee_id || undefined,
      notes: template.notes || '',
    },
  });

  const generateShiftName = (data: z.infer<typeof FormSchema>) => {
    const dayOfWeek = data.dayOfWeek;
    const locationName = locations.find(loc => loc.id === data.locationId)?.name || 'Unknown Location';
    const employeeName = data.employeeId 
      ? activeStaff.find(emp => emp.id === data.employeeId)
        ? `${activeStaff.find(emp => emp.id === data.employeeId)?.first_name} ${activeStaff.find(emp => emp.id === data.employeeId)?.last_name}`
        : 'Unassigned'
      : 'Unassigned';
    
    return `${dayOfWeek} - ${locationName} (${employeeName})`;
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        location_id: data.locationId,
        employee_id: data.employeeId || null,
        notes: data.notes,
        // Auto-generate a name based on day, location, and employee
        name: generateShiftName(data)
      };

      await onUpdate(template.id, formattedData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update shift template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Shift Template</DialogTitle>
          <DialogDescription>
            Update this shift template details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <input
                      type="time"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeStaff.length === 0 ? (
                        <SelectItem value="no-staff" disabled>
                          No active staff members available
                        </SelectItem>
                      ) : (
                        activeStaff.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add any notes about this shift"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
