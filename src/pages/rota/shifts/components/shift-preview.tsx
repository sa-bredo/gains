import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, addDays, startOfWeek, isSameWeek } from 'date-fns';
import { AlertTriangle, Save, ArrowLeft, Edit, Trash2, Copy, MoreVertical, ChevronDown } from 'lucide-react';

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
  
  // Helper to format time (HH:MM:SS -> HH:MM)
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };
  
  // Check if any shifts have conflicts
  const conflictCount = localShifts.filter(shift => shift.hasConflict).length;
  
  // Select all shifts
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
  
  // Handle individual shift selection
  const handleSelectShift = (index: number, checked: boolean) => {
    setSelectedShifts(prev => ({
      ...prev,
      [index]: checked
    }));
  };
  
  // Check if all shifts are selected
  const areAllSelected = localShifts.length > 0 && 
    Object.keys(selectedShifts).length === localShifts.length &&
    Object.values(selectedShifts).every(v => v);
    
  // Count selected shifts
  const selectedCount = Object.values(selectedShifts).filter(v => v).length;
  
  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for ${selectedCount} shifts`);
    // Implement bulk actions based on selected shifts
    // For now, this is just a placeholder
  };
  
  // Handle delete shift
  const handleDeleteShift = (shift: PreviewShift) => {
    setConfirmDeleteShift(shift);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete shift
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
  
  // Handle edit shift
  const handleEditShift = (shift: PreviewShift) => {
    setEditingShift({...shift});
    setEditDialogOpen(true);
  };
  
  // Save edited shift
  const saveEditedShift = () => {
    if (editingShift) {
      const updatedShifts = localShifts.map(shift => {
        if (shift.date.getTime() === editingShift.date.getTime() && 
            shift.start_time === editingShift.start_time &&
            shift.employee_id === editingShift.employee_id) {
          return editingShift;
        }
        return shift;
      });
      
      setLocalShifts(updatedShifts);
      setEditDialogOpen(false);
      setEditingShift(null);
    }
  };
  
  // Handle duplicate shift
  const handleDuplicateShift = (shift: PreviewShift) => {
    const duplicatedShift = {
      ...shift,
      template_id: '',
      template_name: `Copy of ${shift.template_name || ''}`,
    };
    setLocalShifts([...localShifts, duplicatedShift]);
  };

  // Group shifts by week to apply alternating background colors
  const getWeekNumber = (date: Date) => {
    // Get the ISO week number for consistent week identification
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
                // Get the week number for the current shift
                const weekNum = getWeekNumber(shift.date);
                
                // Determine background color based on week number
                // Week 1, 3, 5, etc. (odd weeks) - light blue
                // Week 2, 4, 6, etc. (even weeks) - white
                const isOddWeek = weekNum % 2 === 1;
                const weekBackgroundColor = isOddWeek ? 'bg-sky-50' : ''; // Light blue for odd weeks
                
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
                          onClick={() => handleEditShift(shift)}
                          title="Edit shift"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteShift(shift)}
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
      
      {/* Edit Shift Dialog */}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <div className="p-2 border rounded-md">
                    {format(editingShift.date, 'EEE, MMM d, yyyy')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <div className="p-2 border rounded-md">
                    {editingShift.location_name}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={formatTime(editingShift.start_time)}
                    onChange={(e) => setEditingShift({
                      ...editingShift,
                      start_time: e.target.value + ':00'
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    value={formatTime(editingShift.end_time)}
                    onChange={(e) => setEditingShift({
                      ...editingShift,
                      end_time: e.target.value + ':00'
                    })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Staff Member</label>
                <Select
                  value={editingShift.employee_id || "unassigned"}
                  onValueChange={(value) => {
                    const staff = staffMembers.find(s => s.id === value);
                    setEditingShift({
                      ...editingShift,
                      employee_id: value === "unassigned" ? null : value,
                      employee_name: staff ? `${staff.first_name} ${staff.last_name}` : 'Unassigned'
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staffMembers.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveEditedShift}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
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
      
      {/* Conflict Details Dialog - would be implemented here */}
    </div>
  );
}
