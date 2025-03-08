
import React, { useState } from 'react';
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
import { Location } from '../../shift-templates/types';
import { MapPin } from 'lucide-react';

interface CloneTemplateVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sourceLocationId: string, targetLocationId: string, version: number) => Promise<void>;
  locations: Location[];
  sourceLocationId: string;
  sourceVersion: number;
}

export function CloneTemplateVersionDialog({
  open,
  onOpenChange,
  onConfirm,
  locations,
  sourceLocationId,
  sourceVersion
}: CloneTemplateVersionDialogProps) {
  const [targetLocationId, setTargetLocationId] = useState<string>(sourceLocationId);
  const [isLoading, setIsLoading] = useState(false);

  const handleClone = async () => {
    try {
      setIsLoading(true);
      await onConfirm(sourceLocationId, targetLocationId, sourceVersion);
      onOpenChange(false);
    } catch (error) {
      console.error('Error cloning template version:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sourceLocation = locations.find(l => l.id === sourceLocationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Clone Template Version</DialogTitle>
          <DialogDescription>
            Create a copy of all templates in version {sourceVersion}. 
            You can select a different location to clone to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sourceLocation" className="text-right text-sm font-medium">
              From Location
            </label>
            <div className="col-span-3">
              <div className="flex items-center gap-2 border px-3 py-2 rounded-md">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {sourceLocation?.name || 'Unknown Location'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="targetLocation" className="text-right text-sm font-medium">
              To Location
            </label>
            <div className="col-span-3">
              <Select
                value={targetLocationId}
                onValueChange={setTargetLocationId}
              >
                <SelectTrigger id="targetLocation" className="w-full">
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
          <Button onClick={handleClone} disabled={isLoading || !targetLocationId}>
            {isLoading ? 'Cloning...' : 'Clone Templates'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
