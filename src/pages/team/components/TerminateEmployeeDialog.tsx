
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TeamMember } from '../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember;
  onTerminate: (id: string, date: string) => Promise<any>;
  onSuccess: () => void;
}

export function TerminateEmployeeDialog({ 
  open, 
  onOpenChange, 
  teamMember,
  onTerminate,
  onSuccess
}: TerminateEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [terminationDate, setTerminationDate] = React.useState<Date | undefined>(
    teamMember.end_job_date ? new Date(teamMember.end_job_date) : undefined
  );
  
  const handleTerminate = async () => {
    if (!terminationDate) return;
    
    try {
      setIsSubmitting(true);
      const formattedDate = format(terminationDate, 'yyyy-MM-dd');
      await onTerminate(teamMember.id, formattedDate);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error terminating employee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Terminate Employee</DialogTitle>
          <DialogDescription>
            Set the termination date for {teamMember.first_name} {teamMember.last_name}.
            This will mark the employee as terminated on the selected date.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Termination Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !terminationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {terminationDate ? format(terminationDate, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={terminationDate}
                  onSelect={setTerminationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTerminate}
            disabled={isSubmitting || !terminationDate}
          >
            {isSubmitting ? "Processing..." : "Terminate Employee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
