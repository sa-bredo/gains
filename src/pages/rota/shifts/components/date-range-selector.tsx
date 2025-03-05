
import React, { useState } from 'react';
import { format, addWeeks } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (startDate: Date, weeks: number) => void;
  templateInfo?: {
    locationName: string;
    version: number;
  };
}

export function DateRangeSelector({
  open,
  onOpenChange,
  onContinue,
  templateInfo
}: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [weeks, setWeeks] = useState<number>(1);
  
  const handleContinue = () => {
    onContinue(startDate, weeks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Shifts from Template</DialogTitle>
          <DialogDescription>
            {templateInfo ? (
              <span>
                Using templates from {templateInfo.locationName} (v{templateInfo.version})
              </span>
            ) : (
              "Select a start date and duration for generating shifts."
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Start Date</h3>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              className="pointer-events-auto border rounded-md"
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Duration (weeks)</h3>
            <Select value={weeks.toString()} onValueChange={(value) => setWeeks(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select weeks" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 8, 12].map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    {week} {week === 1 ? 'week' : 'weeks'} - until {format(addWeeks(startDate, week), 'MMM d, yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
