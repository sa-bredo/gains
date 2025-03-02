
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertTriangle, Save, ArrowLeft } from 'lucide-react';

export interface ShiftPreviewItem {
  date: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  location_name?: string;
  employee_id: string | null;
  employee_name?: string;
  version: number;
  hasConflict?: boolean;
}

interface PreviewShift {
  template_id: string;
  template_name?: string;
  date: Date;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location_id: string;
  location_name?: string;
  employee_id: string | null;
  employee_name?: string;
  status: string;
  hasConflict: boolean;
}

interface ShiftPreviewProps {
  shifts: PreviewShift[];
  onSave: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ShiftPreview({ shifts, onSave, onBack, isSubmitting }: ShiftPreviewProps) {
  // Helper to format time (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };
  
  // Check if any shifts have conflicts
  const hasConflicts = shifts.some(shift => shift.hasConflict);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="gap-1"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          {hasConflicts && (
            <div className="flex items-center text-yellow-600 text-sm gap-1 mr-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Some shifts have conflicts with existing shifts</span>
            </div>
          )}
          
          <Button
            onClick={onSave}
            disabled={isSubmitting}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Shifts'}
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium text-left">Date</TableHead>
              <TableHead className="font-medium text-left">Day</TableHead>
              <TableHead className="font-medium text-left">Start</TableHead>
              <TableHead className="font-medium text-left">End</TableHead>
              <TableHead className="font-medium text-left">Staff</TableHead>
              <TableHead className="font-medium text-left">Location</TableHead>
              <TableHead className="font-medium text-left w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No shifts to preview.
                </TableCell>
              </TableRow>
            ) : (
              shifts.map((shift, index) => (
                <TableRow 
                  key={index}
                  className={shift.hasConflict ? 'bg-yellow-50' : undefined}
                >
                  <TableCell className="font-medium">
                    {format(shift.date, 'EEE, MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{shift.day_of_week}</TableCell>
                  <TableCell>{formatTime(shift.start_time)}</TableCell>
                  <TableCell>{formatTime(shift.end_time)}</TableCell>
                  <TableCell>
                    {shift.employee_name || 'Unassigned'}
                  </TableCell>
                  <TableCell>{shift.location_name}</TableCell>
                  <TableCell>
                    {shift.hasConflict ? (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Conflict</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        New
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
