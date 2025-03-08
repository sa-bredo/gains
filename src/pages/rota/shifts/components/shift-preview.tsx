import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, addDays, startOfWeek, isSameWeek, parseISO } from 'date-fns';
import { AlertTriangle, Save, ArrowLeft, Edit, Trash2, Copy, MoreVertical, ChevronDown } from 'lucide-react';
import { StaffAutocomplete } from '@/components/staff-autocomplete';
import { TimeDropdown } from '@/components/time-dropdown';
import { fetchStaffMembers } from '../services/api/staff';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  conflictDetails?: Array<{
    existingShift: any;
    overlapType: 'complete' | 'contained' | 'partial-start' | 'partial-end';
  }>;
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
  conflictDetails?: Array<{
    existingShift: any;
    overlapType: 'complete' | 'contained' | 'partial-start' | 'partial-end';
  }>;
}

interface ShiftPreviewProps {
  shifts: PreviewShift[];
  onSave: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  staffMembers?: Array<{ id: string; first_name: string; last_name: string; role: string }>;
}

export function ShiftPreview({ shifts, onSave, onBack, isSubmitting, staffMembers = [] }: ShiftPreviewProps) {
  const [selectedShifts, setSelectedShifts] = useState<Record<string, boolean>>({});
  const [editingShift, setEditingShift] = useState<PreviewShift | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [localShifts, setLocalShifts] = useState<PreviewShift[]>(shifts);
  const [confirmDeleteShift, setConfirmDeleteShift] = useState<PreviewShift | null>(null);
  const [availableStaffMembers, setAvailableStaffMembers] = useState<Array<{ id: string; first_name: string; last_name: string; role: string }>>([]);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number>(-1);
  
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staff = await fetchStaffMembers();
        setAvailableStaffMembers(staff);
      } catch (error) {
        console.error("Error loading staff members:", error);
      }
    };
    
    loadStaff();
  }, []);
  
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };
  
  const conflictCount = localShifts.filter(shift => shift.hasConflict).length;
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allSelected = localShifts.reduce((acc, shift, index) => {
        acc[index] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedShifts(allSelected);
    } else {
      setSelectedShifts({});
    }
  };
  
  const handleSelectShift = (index: number, checked: boolean) => {
    setSelectedShifts(prev => ({
      ...prev,
      [index]: checked
    }));
  };
  
  const areAllSelected = localShifts.length > 0 && 
    Object.keys(selectedShifts).length === localShifts.length &&
    Object.values(selectedShifts).every(v => v);
  
  const selectedCount = Object.values(selectedShifts).filter(v => v).length;
  
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for ${selectedCount} shifts`);
  };
  
  const handleDeleteShift = (shift: PreviewShift, index: number) => {
    setConfirmDeleteShift(shift);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (confirmDeleteShift) {
      const updatedShifts = localShifts.filter(s => 
        s.date.getTime() !== confirmDeleteShift.date.getTime() || 
        s.start_time !== confirmDeleteShift.start_time ||
        s.employee_id !== confirmDeleteShift.employee_id
      );
      setLocalShifts(updatedShifts);
      setDeleteDialogOpen(false);
      setConfirmDeleteShift(null);
    }
  };
  
  const handleEditShift = (shift: PreviewShift, index: number) => {
    console.log("Opening edit dialog for shift:", shift, "at index:", index);
    setEditingShift({...shift});
    setEditingShiftIndex(index);
    setEditDialogOpen(true);
  };
  
  const saveEditedShift = () => {
    if (editingShift && editingShiftIndex >= 0) {
      console.log("Saving edited shift:", editingShift, "at index:", editingShiftIndex);
      
      const updatedShifts = [...localShifts];
      updatedShifts[editingShiftIndex] = {...editingShift};
      
      console.log("Updated shifts array:", updatedShifts);
      setLocalShifts(updatedShifts);
      setEditDialogOpen(false);
      setEditingShift(null);
      setEditingShiftIndex(-1);
    }
  };
  
  const handleDuplicateShift = (shift: PreviewShift) => {
    const duplicatedShift = {
      ...shift,
      template_id: '',
      template_name: `Copy of ${shift.template_name || ''}`,
    };
    setLocalShifts([...localShifts, duplicatedShift]);
  };

  const getWeekNumber = (date: Date) => {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  };

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
          {conflictCount > 0 && (
            <div className="flex items-center text-yellow-600 text-sm gap-1 mr-2 bg-yellow-50 p-2 rounded-md border border-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <span>Warning: {conflictCount} {conflictCount === 1 ? 'shift has a conflict' : 'shifts have conflicts'} with existing schedules</span>
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
      
      {selectedCount > 0 && (
        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
          <span className="text-sm">{selectedCount} shifts selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Bulk Actions <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('change-staff')}>
                Change Staff
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('adjust-times')}>
                Adjust Times
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10">
                <Checkbox
                  checked={areAllSelected}
                  onCheckedChange={(checked) => {
                    if (typeof checked === 'boolean') {
                      if (checked) {
                        const allSelected = localShifts.reduce((acc, _, index) => {
                          acc[index] = true;
                          return acc;
                        }, {} as Record<string, boolean>);
                        setSelectedShifts(allSelected);
                      } else {
                        setSelectedShifts({});
                      }
                    }
                  }}
                />
              </TableHead>
              <TableHead className="font-medium text-left">Date</TableHead>
              <TableHead className="font-medium text-left">Day</TableHead>
              <TableHead className="font-medium text-left">Start</TableHead>
              <TableHead className="font-medium text-left">End</TableHead>
              <TableHead className="font-medium text-left">Staff</TableHead>
              <TableHead className="font-medium text-left">Location</TableHead>
              <TableHead className="font-medium text-left w-24">Status</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No shifts to preview.
                </TableCell>
              </TableRow>
            ) : (
              localShifts.map((shift, index) => {
                const weekNum = getWeekNumber(shift.date);
                
                const isOddWeek = weekNum % 2 === 1;
                const weekBackgroundColor = isOddWeek ? 'bg-sky-50' : '';
                
                return (
                  <TableRow 
                    key={index}
                    className={
                      shift.hasConflict 
                        ? 'bg-yellow-50' 
                        : weekBackgroundColor
                    }
                  >
                    <TableCell className="pl-4 pr-0">
                      <Checkbox
                        checked={selectedShifts[index] || false}
                        onCheckedChange={(checked) => {
                          handleSelectShift(index, checked === true);
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-left">
                      {format(shift.date, 'EEE, MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-left">{shift.day_of_week}</TableCell>
                    <TableCell className="text-left">{formatTime(shift.start_time)}</TableCell>
                    <TableCell className="text-left">{formatTime(shift.end_time)}</TableCell>
                    <TableCell className="text-left">
                      {shift.employee_name || 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-left">{shift.location_name}</TableCell>
                    <TableCell className="text-left">
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditShift(shift, index)}
                          title="Edit shift"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteShift(shift, index)}
                          title="Delete shift"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateShift(shift)}
                          title="Duplicate shift"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Make changes to this shift
            </DialogDescription>
          </DialogHeader>
          
          {editingShift && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingShift.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingShift.date ? format(editingShift.date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editingShift.date}
                      onSelect={(date) => {
                        if (date) {
                          console.log("Setting new date:", date);
                          setEditingShift({
                            ...editingShift,
                            date,
                            day_of_week: format(date, 'EEEE')
                          });
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <TimeDropdown
                    value={formatTime(editingShift.start_time)}
                    onValueChange={(value) => {
                      console.log("Setting new start time:", value);
                      setEditingShift({
                        ...editingShift,
                        start_time: value + ':00'
                      });
                    }}
                    placeholder="Select start time"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <TimeDropdown
                    value={formatTime(editingShift.end_time)}
                    onValueChange={(value) => {
                      console.log("Setting new end time:", value);
                      setEditingShift({
                        ...editingShift,
                        end_time: value + ':00'
                      });
                    }}
                    placeholder="Select end time"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff Member</label>
                <StaffAutocomplete
                  value={editingShift.employee_id}
                  onChange={(value, displayName) => {
                    console.log("Setting new staff member:", value, displayName);
                    setEditingShift({
                      ...editingShift,
                      employee_id: value,
                      employee_name: displayName || 'Unassigned'
                    });
                  }}
                  placeholder="Select staff member"
                  allowUnassigned={true}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="p-2 border rounded-md">
                  {editingShift.location_name}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEditedShift}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {confirmDeleteShift && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {format(confirmDeleteShift.date, 'EEE, MMM d, yyyy')} 
                {' · '}
                {formatTime(confirmDeleteShift.start_time)} to {formatTime(confirmDeleteShift.end_time)}
                {' · '}
                {confirmDeleteShift.employee_name || 'Unassigned'}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
