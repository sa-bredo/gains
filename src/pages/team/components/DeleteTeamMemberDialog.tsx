
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TeamMember } from '../types';

interface DeleteTeamMemberDialogProps {
  teamMember: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTeamMemberDialog({ 
  teamMember, 
  open, 
  onOpenChange,
  onConfirm 
}: DeleteTeamMemberDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {teamMember.first_name} {teamMember.last_name}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
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
