
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ShiftTemplateFormValues } from '../types';
import { useTeamMembers } from '@/pages/team/hooks/useTeamMembers';
import { TeamMember } from '@/pages/team/types';
import { TimeDropdown } from '@/components/time-dropdown';
import { StaffAutocomplete } from '@/components/staff-autocomplete';

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
  employeeId: z.string().optional(),
});

interface AddShiftTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: ShiftTemplateFormValues) => Promise<void>;
  locations: { id: string; name: string }[];
  selectedLocationId?: string;
}

export function AddShiftTemplateDialog({
  open,
  onOpenChange,
  onAdd,
  locations,
  selectedLocationId,
}: AddShiftTemplateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStaff, setActiveStaff] = useState<TeamMember[]>([]);
  const { fetchActiveStaff } = useTeamMembers();
  
  useEffect(() => {
    const getActiveStaff = async () => {
      try {
        const staff = await fetchActiveStaff();
        // Filter staff to only include front of house and managers
        const filteredStaff = staff.filter(member => 
          member.end_job_date === null && 
          (member.role?.toLowerCase() === 'front_of_house' || 
           member.role?.toLowerCase() === 'manager')
        );
        setActiveStaff(filteredStaff);
      } catch (error) {
        console.error("Error fetching active staff:", error);
        setActiveStaff([]);
      }
    };
    
    if (open) {
      getActiveStaff();
    }
  }, [open, fetchActiveStaff]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      employeeId: undefined,
    },
  });

  const generateShiftName = (data: z.infer<typeof FormSchema>) => {
    const dayOfWeek = data.dayOfWeek;
    const locationName = selectedLocationId 
      ? locations.find(loc => loc.id === selectedLocationId)?.name || 'Unknown Location'
      : 'Unknown Location';
    const employeeName = data.employeeId 
      ? activeStaff.find(emp => emp.id === data.employeeId)
        ? `${activeStaff.find(emp => emp.id === data.employeeId)?.first_name} ${activeStaff.find(emp => emp.id === data.employeeId)?.last_name}`
        : 'Unassigned'
      : 'Unassigned';
    
    return `${dayOfWeek} - ${locationName} (${employeeName})`;
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (!selectedLocationId) {
      console.error("No location selected");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formattedData: ShiftTemplateFormValues = {
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        location_id: selectedLocationId,
        employee_id: data.employeeId || null,
        // Auto-generate a name based on day, location, and employee
        name: generateShiftName(data)
      };

      await onAdd(formattedData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add shift template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Shift Template</DialogTitle>
          <DialogDescription>
            Create a new shift template for your rota.
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
                    <TimeDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select start time"
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
                    <TimeDropdown
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select end time"
                    />
                  </FormControl>
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
                  <FormControl>
                    <StaffAutocomplete
                      value={field.value || null}
                      onChange={(value) => field.onChange(value || undefined)}
                      placeholder="Assign to staff member"
                      allowUnassigned={true}
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
                    Adding...
                  </>
                ) : (
                  'Add Template'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
