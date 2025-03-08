
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Location, ShiftTemplateMaster } from '../../shift-templates/types';
import { ShiftPreview } from './shift-preview';
import { useShiftService } from '../services/shift-service';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from "@/contexts/CompanyContext";

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
  const [isLoading, setIsLoading] = useState(false);
  
  const shiftService = useShiftService();
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  const locationsFetched = useRef(false);
  const isMounted = useRef(true);

  // Load locations and template masters using the ref to prevent multiple fetches
  useEffect(() => {
    if (!currentCompany || locationsFetched.current || !isMounted.current) return;
    
    locationsFetched.current = true; // Mark it as fetched
    
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching initial data for AddShiftsFromTemplate");
        
        const locationsData = await shiftService.fetchLocations();
        if (!isMounted.current) return;
        setLocations(locationsData);
        
        const mastersData = await shiftService.fetchTemplateMasters();
        if (!isMounted.current) return;
        setTemplateMasters(mastersData);
        
        // Auto-select the first location if available
        if (locationsData.length > 0 && !selectedLocation) {
          setSelectedLocation(locationsData[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted.current) {
          toast({
            title: 'Failed to load data',
            description: 'Could not load locations and templates',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    fetchInitialData();
  }, [currentCompany, shiftService, toast, selectedLocation]);

  // Set up isMounted ref for cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Auto-select the highest version when location changes
  useEffect(() => {
    if (selectedLocation) {
      const versions = getVersionsForLocation();
      if (versions.length > 0) {
        // Find the highest version and select it
        const highestVersion = Math.max(...versions);
        setSelectedVersion(highestVersion);
      }
    }
  }, [selectedLocation, templateMasters]);

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
      setIsLoading(true);
      // Fetch templates for the selected location and version
      const templates = await shiftService.fetchTemplatesForLocationAndVersion(
        selectedLocation, 
        selectedVersion
      );
      
      if (!isMounted.current) return;
      
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
      
      // Fetch existing shifts to check for conflicts
      const existingShifts = await shiftService.fetchShifts(
        startDate,
        null,
        selectedLocation
      );
      
      // Check for conflicts between new shifts and existing shifts
      const shiftsWithConflictInfo = await checkForShiftConflicts(shiftsPreview, existingShifts);
      
      // Map the shifts to the preview format with location names
      const mappedShifts = shiftService.mapShiftsToPreview(shiftsWithConflictInfo, locations);
      
      if (!isMounted.current) return;
      setPreviewShifts(mappedShifts);
      setStep('preview');
    } catch (error) {
      console.error('Error generating preview shifts:', error);
      if (isMounted.current) {
        toast({
          title: 'Error',
          description: 'Failed to generate shift preview',
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Check for conflicts between new shifts and existing shifts
  const checkForShiftConflicts = async (newShifts, existingShifts) => {
    return newShifts.map(newShift => {
      const conflicts = existingShifts.filter(existingShift => {
        // Check if same date and employee
        if (newShift.date === existingShift.date && 
            newShift.employee_id === existingShift.employee_id &&
            existingShift.employee_id !== null) {
          
          // Compare time ranges to see if they overlap
          const newStart = convertTimeToMinutes(newShift.start_time);
          const newEnd = convertTimeToMinutes(newShift.end_time);
          const existingStart = convertTimeToMinutes(existingShift.start_time);
          const existingEnd = convertTimeToMinutes(existingShift.end_time);
          
          // Check for any overlap
          return (
            (newStart <= existingEnd && newEnd >= existingStart) ||
            (existingStart <= newEnd && existingEnd >= newStart)
          );
        }
        return false;
      });
      
      // If conflicts are found, add hasConflict flag and conflict details
      if (conflicts.length > 0) {
        return {
          ...newShift,
          hasConflict: true,
          conflictDetails: conflicts.map(conflict => ({
            existingShift: conflict,
            overlapType: getOverlapType(
              convertTimeToMinutes(newShift.start_time),
              convertTimeToMinutes(newShift.end_time),
              convertTimeToMinutes(conflict.start_time),
              convertTimeToMinutes(conflict.end_time)
            )
          }))
        };
      }
      
      return {
        ...newShift,
        hasConflict: false
      };
    });
  };

  // Helper function to convert HH:MM:SS to minutes for easy comparison
  const convertTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  // Determine the type of overlap between shifts
  const getOverlapType = (newStart, newEnd, existingStart, existingEnd) => {
    if (newStart <= existingStart && newEnd >= existingEnd) {
      return 'complete'; // New shift completely covers the existing shift
    } else if (existingStart <= newStart && existingEnd >= newEnd) {
      return 'contained'; // New shift is completely contained within the existing shift
    } else if (newStart < existingStart) {
      return 'partial-end'; // New shift overlaps with the start of the existing shift
    } else {
      return 'partial-start'; // New shift overlaps with the end of the existing shift
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
      
      if (!isMounted.current) return;
      
      toast({
        title: 'Success',
        description: `${shiftsToCreate.length} shifts have been created`,
      });
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving shifts:', error);
      if (isMounted.current) {
        toast({
          title: 'Error',
          description: 'Failed to save shifts',
          variant: 'destructive',
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={selectedLocation}
              onValueChange={value => {
                setSelectedLocation(value);
                // Version will be auto-selected by the useEffect
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
            disabled={!selectedLocation || !selectedVersion || !startDate || isLoading}
          >
            {isLoading ? 'Loading...' : 'Preview Shifts'}
          </Button>
        </div>
      )}
    </div>
  );
}
