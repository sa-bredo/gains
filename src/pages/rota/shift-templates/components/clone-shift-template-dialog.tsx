
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShiftTemplate, Location } from '../types';
import { MapPin } from 'lucide-react';

interface CloneShiftTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClone: (template: ShiftTemplate, newLocationId: string) => Promise<void>;
  template: ShiftTemplate | null;
  locations: Location[];
  currentLocationId: string;
}

export function CloneShiftTemplateDialog({
  open,
  onOpenChange,
  onClone,
  template,
  locations,
  currentLocationId,
}: CloneShiftTemplateDialogProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(currentLocationId);
  const [isLoading, setIsLoading] = useState(false);

  // Reset selected location when the modal opens
  useEffect(() => {
    if (open && currentLocationId) {
      setSelectedLocationId(currentLocationId);
    }
  }, [open, currentLocationId]);

  const handleClone = async () => {
    if (!template) return;
    
    try {
      setIsLoading(true);
      // Create a new template with the selected location
      const templateToClone = {
        ...template,
        location_id: selectedLocationId,
      };
      
      await onClone(templateToClone, selectedLocationId);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cloning template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Clone Shift Template</DialogTitle>
          <DialogDescription>
            Create a copy of this shift template. You can select a different location for the cloned template.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="location" className="text-right text-sm font-medium">
              Location
            </label>
            <div className="col-span-3">
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
              >
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {location.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleClone} disabled={isLoading || !selectedLocationId}>
            {isLoading ? 'Cloning...' : 'Clone Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
