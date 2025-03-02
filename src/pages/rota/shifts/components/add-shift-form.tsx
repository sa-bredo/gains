import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';
import { Location, ShiftTemplate, ShiftTemplateMaster } from '../../shift-templates/types';
import { AddShiftFormValues, addShiftFormSchema } from './add-shift-form-schema';
import { ShiftPreview, ShiftPreviewItem } from './shift-preview';
import { generateWeeksOptions } from '../utils/date-utils';
import { 
  fetchTemplatesForLocationAndVersion,
  generateShiftsPreview,
  mapShiftsToPreview,
  createShifts,
  formatShiftsForCreation
} from '../services/shift-service';

export interface AddShiftFormProps {
  onAddComplete: () => void;
  defaultLocationId?: string;
  defaultVersion?: number;
  locations: Location[];
  templates: ShiftTemplate[];
  templateMasters: ShiftTemplateMaster[];
  onSubmit: (data: AddShiftFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  error: any;
  onLocationChange: (locationId: string) => void;
  onVersionChange: (version: number) => void;
}

export function AddShiftForm({ 
  onAddComplete, 
  defaultLocationId,
  defaultVersion,
  locations,
  templates,
  templateMasters,
  onSubmit: parentOnSubmit,
  onCancel,
  isLoading,
  error,
  onLocationChange,
  onVersionChange
}: AddShiftFormProps) {
  const { toast } = useToast();
  const [filteredMasters, setFilteredMasters] = useState<ShiftTemplateMaster[]>([]);
  const [startDateOptions, setStartDateOptions] = useState<{ value: string; label: string; date: Date }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewShifts, setPreviewShifts] = useState<ShiftPreviewItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string | null>(null);

  const weeksOptions = generateWeeksOptions();

  const form = useForm<AddShiftFormValues>({
    resolver: zodResolver(addShiftFormSchema),
    defaultValues: {
      location_id: defaultLocationId || '',
      version: defaultVersion || 0,
      start_date: '',
      weeks: 1,
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (defaultLocationId) {
          form.setValue('location_id', defaultLocationId);
          const filteredMasters = templateMasters.filter(master => master.location_id === defaultLocationId);
          setFilteredMasters(filteredMasters);
          
          if (filteredMasters.length > 0) {
            form.setValue('version', filteredMasters[0].version);
            await loadTemplatesAndDates(defaultLocationId, filteredMasters[0].version);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load form data. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    loadInitialData();
  }, [defaultLocationId, templateMasters, form]);

  const loadTemplatesAndDates = async (locationId: string, version: number) => {
    try {
      const templatesData = await fetchTemplatesForLocationAndVersion(locationId, version);
      
      if (templatesData.length > 0) {
        const sortedTemplates = [...templatesData].sort((a, b) => {
          const dayOrder = { 
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
            'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 
          };
          return dayOrder[a.day_of_week as keyof typeof dayOrder] - dayOrder[b.day_of_week as keyof typeof dayOrder];
        });
        
        const firstDay = sortedTemplates[0].day_of_week;
        setFirstDayOfWeek(firstDay);
        
        const today = new Date();
        const dateOptions = [];
        
        let currentDate = new Date(today);
        for (let i = 0; i < 4; i++) {
          while (true) {
            const dayName = format(currentDate, 'EEEE');
            if (dayName === firstDay) {
              dateOptions.push({
                value: format(currentDate, 'yyyy-MM-dd'),
                label: format(currentDate, 'EEEE, MMMM d, yyyy'),
                date: new Date(currentDate)
              });
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        
        setStartDateOptions(dateOptions);
        
        if (dateOptions.length > 0) {
          form.setValue('start_date', dateOptions[0].value);
        }
      } else {
        setStartDateOptions([]);
        setFirstDayOfWeek(null);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLocationChange = (locationId: string) => {
    const filtered = templateMasters.filter(master => master.location_id === locationId);
    setFilteredMasters(filtered);
    
    form.setValue('version', filtered.length > 0 ? filtered[0].version : 0);
    form.setValue('start_date', '');
    
    onLocationChange(locationId);
  };

  const handleVersionChange = (version: number) => {
    onVersionChange(version);
  };

  const onLocalSubmit = (data: AddShiftFormValues) => {
    if (templates.length === 0) {
      toast({
        title: 'No Templates',
        description: 'There are no shift templates for this location and version.',
        variant: 'destructive',
      });
      return;
    }
    
    const startDate = parse(data.start_date, 'yyyy-MM-dd', new Date());
    
    const shifts = generateShiftsPreview(templates, startDate, data.weeks);
    setPreviewShifts(shifts);
    setShowPreview(true);
  };

  const handleSaveShifts = async () => {
    try {
      setIsSubmitting(true);
      
      const shiftsToCreate = formatShiftsForCreation(previewShifts);
      
      await createShifts(shiftsToCreate);
      
      toast({
        title: 'Success',
        description: `${previewShifts.length} shifts have been created.`,
      });
      
      form.reset();
      setShowPreview(false);
      setPreviewShifts([]);
      
      onAddComplete();
    } catch (error) {
      console.error('Error creating shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shifts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackFromPreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {!showPreview ? (
        <div className="max-w-[250px]">
          <h2 className="text-xl font-semibold mb-4">Add Shifts from Template</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(parentOnSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-left block">Location</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleLocationChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
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
                    <FormLabel className="font-bold text-left block">Template Version</FormLabel>
                    <Select
                      disabled={isLoading || filteredMasters.length === 0}
                      onValueChange={(value) => {
                        const numValue = parseInt(value, 10);
                        field.onChange(numValue);
                        handleVersionChange(numValue);
                      }}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template version" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredMasters.map((master) => (
                          <SelectItem key={`${master.location_id}-${master.version}`} value={master.version.toString()}>
                            Version {master.version}
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
                    <FormLabel className="font-bold text-left block">Start Date</FormLabel>
                    <Select
                      disabled={isLoading || startDateOptions.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select a ${firstDayOfWeek || 'start date'}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {startDateOptions.map((option) => (
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
                    <FormLabel className="font-bold text-left block">Number of Weeks</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={field.value.toString()}
                    >
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
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || templates.length === 0}
                >
                  Preview Shifts
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : (
        <ShiftPreview
          shifts={mapShiftsToPreview(previewShifts, locations)}
          onSave={handleSaveShifts}
          onBack={handleBackFromPreview}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
