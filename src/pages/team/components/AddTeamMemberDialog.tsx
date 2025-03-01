
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
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { TeamMemberFormValues } from '../types';
import { BasicInfoFields } from './form-fields/BasicInfoFields';
import { ContactInfoFields } from './form-fields/ContactInfoFields';
import { RoleField } from './form-fields/RoleField';
import { DateOfBirthField } from './form-fields/DateOfBirthField';
import { HourlyRateField } from './form-fields/HourlyRateField';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (member: TeamMemberFormValues) => Promise<any>;
  onSuccess: () => void;
}

// Export the schema so it can be used in field components
export const formSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  mobile_number: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
  hourly_rate: z.coerce.number().optional(),
});

export function AddTeamMemberDialog({ 
  open, 
  onOpenChange, 
  onAdd,
  onSuccess 
}: AddTeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      mobile_number: '',
      address: '',
      date_of_birth: undefined,
      hourly_rate: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Ensure all required fields are provided in the correct type
      const memberData: TeamMemberFormValues = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role: values.role,
        mobile_number: values.mobile_number,
        address: values.address,
        date_of_birth: values.date_of_birth,
        hourly_rate: values.hourly_rate,
        start_job_date: new Date().toISOString().split('T')[0], // Set to current date
      };
      
      await onAdd(memberData);
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding team member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Enter the details for the new team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            <ContactInfoFields form={form} />
            
            {/* Role and Hourly Rate row */}
            <div className="grid grid-cols-2 gap-4">
              <RoleField form={form} />
              <HourlyRateField form={form} />
            </div>
            
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
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
