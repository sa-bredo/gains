
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TeamMember, TeamMemberFormValues, ROLE_OPTIONS } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateOfBirthField } from './form-fields/DateOfBirthField';
import { HourlyRateField } from './form-fields/HourlyRateField';

interface EditTeamMemberDialogProps {
  teamMember: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onSuccess: () => void;
}

const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  mobile_number: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  hourly_rate: z.coerce.number().optional(),
});

export function EditTeamMemberDialog({ 
  teamMember,
  open, 
  onOpenChange, 
  onUpdate,
  onSuccess 
}: EditTeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Create the form with proper default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: teamMember.first_name,
      last_name: teamMember.last_name,
      email: teamMember.email,
      role: teamMember.role,
      mobile_number: teamMember.mobile_number || '',
      address: teamMember.address || '',
      date_of_birth: teamMember.date_of_birth || '',
      hourly_rate: teamMember.hourly_rate || undefined,
    },
  });

  // Reset form when team member changes or dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        first_name: teamMember.first_name,
        last_name: teamMember.last_name,
        email: teamMember.email,
        role: teamMember.role,
        mobile_number: teamMember.mobile_number || '',
        address: teamMember.address || '',
        date_of_birth: teamMember.date_of_birth || '',
        hourly_rate: teamMember.hourly_rate || undefined,
      });
    }
  }, [teamMember, open, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting update for member:", teamMember.id, values);
      
      // Make sure all fields are properly typed
      const updates: Partial<TeamMember> = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role: values.role,
        mobile_number: values.mobile_number || null,
        address: values.address || null,
        date_of_birth: values.date_of_birth || null,
        hourly_rate: values.hourly_rate || null,
      };
      
      await onUpdate(teamMember.id, updates);
      
      // Only close dialog after successful update
      onOpenChange(false);
      
      // Call onSuccess callback after everything is done
      onSuccess();
    } catch (error) {
      console.error('Error updating team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // If we're closing the dialog and not submitting, clean up
      if (!newOpen && !isSubmitting) {
        setTimeout(() => form.reset(), 100);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update the details for this team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <HourlyRateField form={form} />
            </div>
            
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DateOfBirthField form={form} />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
