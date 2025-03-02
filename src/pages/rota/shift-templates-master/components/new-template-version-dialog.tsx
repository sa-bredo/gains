
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Location } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface NewTemplateVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: Location[];
  onConfirm: (locationId: string, newVersion: number) => void;
}

interface FormValues {
  locationId: string;
}

export function NewTemplateVersionDialog({
  open,
  onOpenChange,
  locations,
  onConfirm
}: NewTemplateVersionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nextVersionMap, setNextVersionMap] = useState<Record<string, number>>({});
  
  const form = useForm<FormValues>({
    defaultValues: {
      locationId: '',
    },
  });
  
  const selectedLocationId = form.watch('locationId');
  
  // Fetch the latest version number for each location
  useEffect(() => {
    if (open && locations.length > 0) {
      const fetchLatestVersions = async () => {
        setIsLoading(true);
        
        try {
          // For each location, get the highest version number
          const versionMap: Record<string, number> = {};
          
          for (const location of locations) {
            const { data, error } = await supabase
              .from('shift_templates')
              .select('version')
              .eq('location_id', location.id)
              .order('version', { ascending: false })
              .limit(1);
              
            if (!error && data && data.length > 0) {
              versionMap[location.id] = data[0].version + 1; // Next version
            } else {
              versionMap[location.id] = 1; // Start with version 1
            }
          }
          
          setNextVersionMap(versionMap);
        } catch (error) {
          console.error('Error fetching latest versions:', error);
          toast.error('Failed to fetch latest version numbers');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchLatestVersions();
    }
  }, [open, locations]);
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      const locationId = values.locationId;
      const newVersion = nextVersionMap[locationId] || 1;
      
      onConfirm(locationId, newVersion);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating new template version:', error);
      toast.error('Failed to create new template version');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getNextVersion = () => {
    if (!selectedLocationId) return null;
    return nextVersionMap[selectedLocationId] || 1;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Template Set</DialogTitle>
          <DialogDescription>
            Create a new version of shift templates for a location.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-w-[250px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-left block">Location</FormLabel>
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
              
              {selectedLocationId && (
                <div className="flex items-center justify-between border p-3 rounded-md bg-muted/30">
                  <span className="text-sm font-medium">New Version</span>
                  <span className="font-mono bg-primary-foreground px-2 py-1 rounded text-sm">
                    v{getNextVersion()}
                  </span>
                </div>
              )}
              
              <DialogFooter>
                <Button type="submit" disabled={isLoading || !selectedLocationId}>
                  Create Template Set
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
