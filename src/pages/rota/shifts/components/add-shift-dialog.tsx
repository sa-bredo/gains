import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ShiftTemplate } from '../../shift-templates/types';
import { useShiftService } from '../services/shift-service';
import { AddShiftForm } from './add-shift-form';
import { DateRangeSelector } from './date-range-selector';
import { ShiftPreview } from './shift-preview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComplete?: () => void;
  defaultLocationId?: string;
  defaultVersion?: number;
}

export function AddShiftDialog({
  open,
  onOpenChange,
  onAddComplete,
  defaultLocationId,
  defaultVersion
}: AddShiftDialogProps) {
  const { toast } = useToast();
  const shiftService = useShiftService();
  
  const [dialogMode, setDialogMode] = useState<'form' | 'date-selector' | 'preview'>('form');
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(1);
  const [previewShifts, setPreviewShifts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationName, setLocationName] = useState<string>('');
  
  // Fetch templates if default location and version are provided
  useEffect(() => {
    const fetchTemplatesFromLocationAndVersion = async () => {
      if (defaultLocationId && defaultVersion) {
        try {
          const fetchedTemplates = await shiftService.fetchTemplatesForLocationAndVersion(
            defaultLocationId,
            defaultVersion
          );
          setTemplates(fetchedTemplates);
          
          // Get locations to find the location name
          const fetchedLocations = await shiftService.fetchLocations();
          setLocations(fetchedLocations);
          
          const location = fetchedLocations.find(loc => loc.id === defaultLocationId);
          if (location) {
            setLocationName(location.name);
          }
          
          // Set dialog mode to date selector
          setDialogMode('date-selector');
        } catch (error) {
          console.error('Error fetching templates:', error);
          toast({
            title: 'Error',
            description: 'Failed to load shift templates.',
            variant: 'destructive',
          });
        }
      }
    };
    
    if (open) {
      fetchTemplatesFromLocationAndVersion();
    } else {
      // Reset state when dialog closes
      setDialogMode(defaultLocationId && defaultVersion ? 'date-selector' : 'form');
      setPreviewShifts([]);
      setIsSubmitting(false);
    }
  }, [open, defaultLocationId, defaultVersion, shiftService, toast]);
  
  const handleDateRangeContinue = async (startDate: Date, weeks: number) => {
    try {
      setSelectedStartDate(startDate);
      setSelectedWeeks(weeks);
      
      if (!templates.length) {
        toast({
          title: 'No templates',
          description: 'No shift templates found for this location and version.',
          variant: 'destructive',
        });
        return;
      }
      
      // Generate shift previews from templates
      const shiftPreviews = shiftService.generateShiftsPreview(templates, startDate, weeks);
      
      // Map shifts to preview format
      const mappedShifts = shiftService.mapShiftsToPreview(shiftPreviews, locations);
      setPreviewShifts(mappedShifts);
      
      // Switch to preview mode
      setDialogMode('preview');
    } catch (error) {
      console.error('Error generating shift previews:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate shift previews.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSaveShifts = async () => {
    try {
      setIsSubmitting(true);
      
      if (!previewShifts.length) {
        toast({
          title: 'No shifts',
          description: 'No shifts to save.',
          variant: 'warning',
        });
        return;
      }
      
      // Format shifts for database insertion
      const shiftsToCreate = shiftService.formatShiftsForCreation(
        previewShifts.map(shift => ({
          date: format(shift.date, 'yyyy-MM-dd'),
          day_of_week: shift.day_of_week,
          start_time: shift.start_time,
          end_time: shift.end_time,
          location_id: shift.location_id,
          employee_id: shift.employee_id,
          employee_name: shift.employee_name,
          version: templates[0]?.version || 1,
        }))
      );
      
      // Create shifts in database
      await shiftService.createShifts(shiftsToCreate);
      
      toast({
        title: 'Success',
        description: `${shiftsToCreate.length} shifts created successfully.`,
        variant: 'default',
      });
      
      // Close dialog and notify parent
      onOpenChange(false);
      if (onAddComplete) {
        onAddComplete();
      }
    } catch (error) {
      console.error('Error saving shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shifts.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleBackToDateSelector = () => {
    setDialogMode('date-selector');
  };
  
  const getDialogContent = () => {
    switch (dialogMode) {
      case 'date-selector':
        return (
          <DateRangeSelector
            open={open}
            onOpenChange={onOpenChange}
            onContinue={handleDateRangeContinue}
            templateInfo={
              defaultLocationId && defaultVersion
                ? { locationName, version: defaultVersion }
                : undefined
            }
          />
        );
      case 'preview':
        return (
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Preview Shifts</DialogTitle>
                <DialogDescription>
                  Review the shifts that will be created based on the template.
                </DialogDescription>
              </DialogHeader>
              
              <ShiftPreview
                shifts={previewShifts}
                onSave={handleSaveShifts}
                onBack={handleBackToDateSelector}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        );
      case 'form':
      default:
        return (
          <AddShiftForm
            open={open}
            onOpenChange={onOpenChange}
            onAddComplete={onAddComplete}
          />
        );
    }
  };
  
  return getDialogContent();
}
