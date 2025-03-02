
import React, { useState } from 'react';
import { ShiftTemplate, Location, StaffMember, DAYS_OF_WEEK } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, Clock, CalendarIcon, MapPin, User, Save, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShiftTemplatesTableProps {
  templates: ShiftTemplate[];
  locations: Location[];
  staffMembers: StaffMember[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClone: (template: ShiftTemplate) => Promise<void>;
}

export function ShiftTemplatesTable({ 
  templates, 
  locations, 
  staffMembers, 
  isLoading, 
  onUpdate, 
  onDelete, 
  onClone 
}: ShiftTemplatesTableProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ShiftTemplate>>({});
  
  // Handle starting to edit a template
  const startEditing = (template: ShiftTemplate) => {
    setEditingRow(template.id);
    setEditData({
      name: template.name,
      day_of_week: template.day_of_week,
      start_time: template.start_time,
      end_time: template.end_time,
      location_id: template.location_id,
      employee_id: template.employee_id || undefined,
      notes: template.notes || undefined
    });
  };

  // Handle saving edits
  const saveEdits = async (id: string) => {
    try {
      await onUpdate(id, editData);
      setEditingRow(null);
      setEditData({});
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save shift template');
    }
  };

  // Handle canceling edits
  const cancelEdits = () => {
    setEditingRow(null);
    setEditData({});
  };

  // Handle field changes
  const handleChange = (field: string, value: string | null) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

  // Format time for display (HH:MM:SS to HH:MM AM/PM)
  const formatTime = (time: string) => {
    try {
      // Convert "HH:MM:SS" to "HH:MM AM/PM"
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return time;
    }
  };

  // Handle delete confirmation
  const handleDelete = async (template: ShiftTemplate) => {
    if (window.confirm(`Are you sure you want to delete ${template.name}?`)) {
      try {
        await onDelete(template.id);
        toast.success('Shift template deleted');
      } catch (error) {
        console.error('Error deleting template:', error);
        toast.error('Failed to delete shift template');
      }
    }
  };

  // Handle cloning a template
  const handleClone = async (template: ShiftTemplate) => {
    try {
      await onClone(template);
      toast.success('Shift template cloned');
    } catch (error) {
      console.error('Error cloning template:', error);
      toast.error('Failed to clone shift template');
    }
  };

  // Get staff member name
  const getStaffName = (template: ShiftTemplate) => {
    if (!template.employee_id || !template.employees) return '—';
    return `${template.employees.first_name} ${template.employees.last_name}`;
  };

  // Sort templates by day of week
  const sortedTemplates = [...templates].sort((a, b) => {
    const dayA = DAYS_OF_WEEK.indexOf(a.day_of_week);
    const dayB = DAYS_OF_WEEK.indexOf(b.day_of_week);
    return dayA - dayB;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No shift templates found. Add a template to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedTemplates.map((template) => (
                <TableRow key={template.id}>
                  {/* Name */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Input 
                        className="w-full"
                        value={editData.name || ''} 
                        onChange={(e) => handleChange('name', e.target.value)} 
                      />
                    ) : (
                      <span className="font-medium">{template.name}</span>
                    )}
                  </TableCell>
                  
                  {/* Day of Week */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Select 
                        value={editData.day_of_week || template.day_of_week} 
                        onValueChange={(value) => handleChange('day_of_week', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {template.day_of_week}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Start Time */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Input 
                        className="w-full"
                        type="time"
                        value={editData.start_time?.substring(0, 5) || template.start_time.substring(0, 5)} 
                        onChange={(e) => handleChange('start_time', e.target.value + ':00')} 
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(template.start_time)}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* End Time */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Input 
                        className="w-full"
                        type="time"
                        value={editData.end_time?.substring(0, 5) || template.end_time.substring(0, 5)} 
                        onChange={(e) => handleChange('end_time', e.target.value + ':00')} 
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(template.end_time)}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Location */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Select 
                        value={editData.location_id || template.location_id} 
                        onValueChange={(value) => handleChange('location_id', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {template.locations?.name || '—'}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Staff */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Select 
                        value={editData.employee_id || ''} 
                        onValueChange={(value) => handleChange('employee_id', value || null)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select staff (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.first_name} {staff.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getStaffName(template)}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Notes */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Textarea 
                        className="w-full"
                        value={editData.notes || ''} 
                        onChange={(e) => handleChange('notes', e.target.value)} 
                        placeholder="Add notes (optional)"
                      />
                    ) : (
                      <span className="text-sm">{template.notes || '—'}</span>
                    )}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell className="text-right">
                    {editingRow === template.id ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveEdits(template.id)}
                          title="Save changes"
                        >
                          <Save className="h-4 w-4" />
                          <span className="sr-only">Save</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdits}
                          title="Cancel edits"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancel</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                            >
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEditing(template)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleClone(template)}>
                              Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(template)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
