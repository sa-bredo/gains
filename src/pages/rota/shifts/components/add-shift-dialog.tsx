
import React, { useState, useEffect } from 'react';
import { parse } from 'date-fns';
import { Location, ShiftTemplate, ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ShiftPreview, ShiftPreviewItem } from './shift-preview';
import { AddShiftForm } from './add-shift-form';
import { AddShiftFormValues } from './add-shift-form-schema';
import { 
  fetchLocations, 
  fetchTemplateMasters, 
  fetchTemplatesForLocationAndVersion,
  generateShiftsPreview,
  mapShiftsToPreview,
  formatShiftsForCreation,
  createShifts
} from '../services/shift-service';

export interface AddShiftDialogProps {
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [generatedShifts, setGeneratedShifts] = useState<ShiftPreviewItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [locationsData, mastersData] = await Promise.all([
          fetchLocations(),
          fetchTemplateMasters()
        ]);
        
        setLocations(locationsData);
        setTemplateMasters(mastersData);
        
        // If defaultLocationId is provided, fetch templates for that location
        if (defaultLocationId) {
          // Find the latest version for the selected location if defaultVersion is not provided
          const version = defaultVersion || findLatestVersionForLocation(mastersData, defaultLocationId);
          if (version) {
            const templatesData = await fetchTemplatesForLocationAndVersion(defaultLocationId, version);
            setTemplates(templatesData);
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Failed to load data",
          description: "There was a problem loading the initial data.",
          variant: "destructive",
        });
      }
    };
    
    if (open) {
      loadInitialData();
    }
  }, [open, defaultLocationId, defaultVersion, toast]);

  // Find the latest version for a location
  const findLatestVersionForLocation = (masters: ShiftTemplateMaster[], locationId: string): number => {
    const locationMasters = masters.filter(m => m.location_id === locationId);
    return locationMasters.length > 0 
      ? Math.max(...locationMasters.map(m => m.version))
      : 1;
  };

  // Handle location change
  const handleLocationChange = async (locationId: string) => {
    try {
      if (locationId) {
        // Find the latest version for the selected location
        const latestVersion = findLatestVersionForLocation(templateMasters, locationId);
        
        // Fetch templates for the location and version
        const templatesData = await fetchTemplatesForLocationAndVersion(locationId, latestVersion);
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error("Error handling location change:", error);
      toast({
        title: "Failed to load templates",
        description: "There was a problem loading the templates for the selected location.",
        variant: "destructive",
      });
    }
  };

  // Handle version change
  const handleVersionChange = async (version: number) => {
    try {
      const locationId = locations.length > 0 ? locations[0].id : '';
      if (locationId) {
        // Fetch templates for the location and version
        const templatesData = await fetchTemplatesForLocationAndVersion(locationId, version);
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error("Error handling version change:", error);
      toast({
        title: "Failed to load templates",
        description: "There was a problem loading the templates for the selected version.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission
  const onSubmit = async (values: AddShiftFormValues) => {
    setError(null);
    setIsGenerating(true);
    try {
      const startDate = parse(values.start_date, 'yyyy-MM-dd', new Date());
      const weeks = values.weeks;

      // Generate shifts preview
      const shifts = generateShiftsPreview(templates, startDate, weeks);
      setGeneratedShifts(shifts);
      setShowPreview(true);
    } catch (e: any) {
      console.error("Error generating shifts:", e);
      setError(e);
      toast({
        title: "Failed to generate shifts",
        description: "There was a problem generating the shifts.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to create shifts in Supabase
  const handleCreateShifts = async () => {
    setIsCreating(true);
    try {
      // Map shifts to the format expected by the shifts table
      const shiftsToCreate = formatShiftsForCreation(generatedShifts);

      // Create the shifts
      await createShifts(shiftsToCreate);

      toast({
        title: "Shifts created successfully",
        description: "The shifts have been created successfully.",
      });
      onOpenChange(false);
      setGeneratedShifts([]);
      setShowPreview(false);
      if (onAddComplete) {
        onAddComplete();
      }
    } catch (e: any) {
      console.error("Error creating shifts:", e);
      setError(e);
      toast({
        title: "Failed to create shifts",
        description: "There was a problem creating the shifts.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    setShowPreview(false);
  };

  // Create preview shifts from the generated shifts data
  const previewShifts = mapShiftsToPreview(generatedShifts, locations);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Shifts</DialogTitle>
          <DialogDescription>
            Generate shifts based on a shift template.
          </DialogDescription>
        </DialogHeader>
        
        {showPreview ? (
          <ShiftPreview 
            shifts={previewShifts} 
            onSave={handleCreateShifts} 
            onBack={handleBack}
            isSubmitting={isCreating}
          />
        ) : (
          <AddShiftForm
            locations={locations}
            templates={templates}
            templateMasters={templateMasters}
            defaultLocationId={defaultLocationId}
            defaultVersion={defaultVersion}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isGenerating}
            error={error}
            onLocationChange={handleLocationChange}
            onVersionChange={handleVersionChange}
          />
        )}
        
        {!showPreview && (
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                const formElement = document.querySelector('form');
                if (formElement) {
                  formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }} 
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Preview Shifts"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
