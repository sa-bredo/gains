
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Loader2 } from 'lucide-react';

interface DeleteTemplateMasterDialogProps {
  templateMaster: ShiftTemplateMaster;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (locationId: string, version: number) => Promise<void>;
}

export function DeleteTemplateMasterDialog({ 
  templateMaster, 
  open, 
  onOpenChange, 
  onDelete 
}: DeleteTemplateMasterDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(templateMaster.location_id, templateMaster.version);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete template version:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Template Version</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the template version {templateMaster.version} for {templateMaster.location_name}? This will remove all shift templates associated with this version and cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
