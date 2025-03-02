
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Location } from '../types';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, { message: 'Location name is required' }),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Location, 'id' | 'created_at'>) => Promise<Location | undefined>;
}

export function AddLocationDialog({ open, onOpenChange, onAdd }: AddLocationDialogProps) {
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure name is provided and properly typed
      const locationData: Omit<Location, 'id' | 'created_at'> = {
        name: values.name,
        address: values.address || null,
      };
      
      await onAdd(locationData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Location name" {...field} />
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
                    <Textarea 
                      placeholder="Full address (optional)"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Add Location
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
