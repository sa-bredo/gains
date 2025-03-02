
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
  employeeId: z.string().optional(),
});

// Generate time options in 30-minute increments from 5:00 AM to 10:00 PM
const generateTimeOptions = () => {
  const options: string[] = [];
  const startHour = 5; // 5 AM
  const endHour = 22; // 10 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    options.push(`${hourStr}:00`);
    // Don't add :30 for the last hour (10 PM)
    if (hour < endHour) {
      options.push(`${hourStr}:30`);
    }
  }
  
  return options;
};

const timeOptions = generateTimeOptions();

interface EditShiftTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
  template: ShiftTemplate;
  locations: { id: string; name: string }[];
  selectedLocationId?: string;
}

export function EditShiftTemplateDialog({
  open,
  onOpenChange,
  onUpdate,
  template,
  locations,
  selectedLocationId,
}: EditShiftTemplateDialogProps) {
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
      dayOfWeek: template.day_of_week,
      startTime: template.start_time,
      endTime: template.end_time,
      employeeId: template.employee_id || undefined,
    },
  });

  const generateShiftName = (data: z.infer<typeof FormSchema>) => {
    const dayOfWeek = data.dayOfWeek;
    const locationId = selectedLocationId || template.location_id;
    const locationName = locations.find(loc => loc.id === locationId)?.name || 'Unknown Location';
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
      const updatedData: Partial<ShiftTemplate> = {
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        employee_id: data.employeeId || null,
        name: generateShiftName(data),
      };

      await onUpdate(template.id, updatedData);
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
            Update the details of your shift template.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
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
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
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
