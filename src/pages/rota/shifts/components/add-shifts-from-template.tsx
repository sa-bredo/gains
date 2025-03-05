
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Location, ShiftTemplateMaster } from '../../shift-templates/types';
import { ShiftPreview } from './shift-preview';
import { useShiftService } from '../services/shift-service';
import { useToast } from '@/hooks/use-toast';

interface AddShiftsFromTemplateProps {
  onBack: () => void;
  onComplete?: () => void;
}

export function AddShiftsFromTemplate({ onBack, onComplete }: AddShiftsFromTemplateProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [weeks, setWeeks] = useState<string>('1');
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [previewShifts, setPreviewShifts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const shiftService = useShiftService();
  const { toast } = useToast();

  // Load locations and template masters
  useEffect(() => {
    const loadData = async () => {
      try {
        const locationsData = await shiftService.fetchLocations();
        setLocations(locationsData);
        
        const mastersData = await shiftService.fetchTemplateMasters();
        setTemplateMasters(mastersData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Failed to load data',
          description: 'Could not load locations and templates',
          variant: 'destructive',
        });
      }
    };
    
    loadData();
  }, [shiftService, toast]);

  const handlePreviewShifts = async () => {
    if (!selectedLocation || !selectedVersion || !startDate) {
      toast({
        title: 'Missing information',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Fetch templates for the selected location and version
      const templates = await shiftService.fetchTemplatesForLocationAndVersion(
        selectedLocation, 
        selectedVersion
      );
      
      if (templates.length === 0) {
        toast({
          title: 'No templates found',
          description: 'No shift templates found for the selected location and version',
          variant: 'destructive',
        });
        return;
      }
      
      // Generate preview shifts based on templates and date range
      const shiftsPreview = shiftService.generateShiftsPreview(
        templates,
        startDate,
        parseInt(weeks)
      );
      
      // Map the shifts to the preview format with location names
      const mappedShifts = shiftService.mapShiftsToPreview(shiftsPreview, locations);
      
      setPreviewShifts(mappedShifts);
      setStep('preview');
    } catch (error) {
      console.error('Error generating preview shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate shift preview',
        variant: 'destructive',
      });
    }
  };

  const handleSaveShifts = async () => {
    setIsSubmitting(true);
    try {
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
          version: selectedVersion || 1,
        }))
      );
      
      // Create shifts in the database
      await shiftService.createShifts(shiftsToCreate);
      
      toast({
        title: 'Success',
        description: `${shiftsToCreate.length} shifts have been created`,
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving shifts:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shifts',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get versions for the selected location
  const getVersionsForLocation = () => {
    if (!selectedLocation) return [];
    
    return templateMasters
      .filter(master => master.location_id === selectedLocation)
      .map(master => master.version);
  };

  // Generate weeks options
  const weeksOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: i === 0 ? '1 week' : `${i + 1} weeks`,
  }));

  if (step === 'preview') {
    return (
      <ShiftPreview 
        shifts={previewShifts}
        onSave={handleSaveShifts}
        onBack={() => setStep('form')}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Add Shifts from Template</h2>
        <Button variant="outline" onClick={onBack}>Cancel</Button>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select
            value={selectedLocation}
            onValueChange={value => {
              setSelectedLocation(value);
              setSelectedVersion(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="template-version">Template Version</Label>
          <Select
            value={selectedVersion?.toString() || ''}
            onValueChange={value => setSelectedVersion(parseInt(value))}
            disabled={!selectedLocation}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select template version" />
            </SelectTrigger>
            <SelectContent>
              {getVersionsForLocation().map(version => (
                <SelectItem key={version} value={version.toString()}>
                  Version {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weeks">Number of Weeks</Label>
          <Select value={weeks} onValueChange={setWeeks}>
            <SelectTrigger>
              <SelectValue placeholder="Select number of weeks" />
            </SelectTrigger>
            <SelectContent>
              {weeksOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="w-full"
          onClick={handlePreviewShifts}
          disabled={!selectedLocation || !selectedVersion || !startDate}
        >
          Preview Shifts
        </Button>
      </div>
    </div>
  );
}
