
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeamMember } from '../types';

interface TerminateEmployeeDialogProps {
  teamMember: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (endDate: string) => void;
}

export function TerminateEmployeeDialog({ 
  teamMember, 
  open, 
  onOpenChange,
  onConfirm 
}: TerminateEmployeeDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleTerminate = () => {
    setIsSubmitting(true);
    
    // Format date as YYYY-MM-DD for backend
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      onConfirm(formattedDate);
    } finally {
      setIsSubmitting(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Terminate Employee</DialogTitle>
          <DialogDescription>
            Set the end date for {teamMember.first_name} {teamMember.last_name}.
            After this date, they will no longer be considered an active employee.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">End Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Terminate Employee'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
