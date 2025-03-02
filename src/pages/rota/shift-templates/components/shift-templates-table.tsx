
import React, { useState, useEffect } from 'react';
import { ShiftTemplate, Location, StaffMember, DAYS_OF_WEEK, DayOfWeek } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Trash2, Clock, CalendarIcon, User, Save, X, MoreVertical, Edit, Check } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ShiftTemplatesTableProps {
  templates: ShiftTemplate[];
  locations: Location[];
  staffMembers: StaffMember[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClone: (template: ShiftTemplate) => Promise<void>;
  selectedLocationId: string | null;
}

export function ShiftTemplatesTable({ 
  templates, 
  locations, 
  staffMembers, 
  isLoading, 
  onUpdate, 
  onDelete, 
  onClone,
  selectedLocationId
}: ShiftTemplatesTableProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ShiftTemplate>>({});
  const [activeStaffMembers, setActiveStaffMembers] = useState<StaffMember[]>([]);
  
  // Filter templates by selected location
  const filteredTemplates = selectedLocationId 
    ? templates.filter(template => template.location_id === selectedLocationId)
    : templates;

  // Fetch active staff members
  useEffect(() => {
    const fetchActiveStaff = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, email')
        .is('end_job_date', null)
        .in('role', ['Front Of House', 'Manager'])
        .order('last_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching staff:', error);
        return;
      }
      
      setActiveStaffMembers(data || []);
    };

    fetchActiveStaff();
  }, []);
  
  // Handle starting to edit a template
  const startEditing = (template: ShiftTemplate) => {
    setEditingRow(template.id);
    setEditData({
      day_of_week: template.day_of_week as DayOfWeek,
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
      // Make a copy of editData to avoid reference issues
      const dataToUpdate = { ...editData };
      
      // If employee_id is "none", set it to null
      if (dataToUpdate.employee_id === "none") {
        dataToUpdate.employee_id = null;
      }
      
      // Generate a name based on day and time if not provided
      if (!dataToUpdate.name) {
        dataToUpdate.name = `${dataToUpdate.day_of_week} ${dataToUpdate.start_time?.substring(0, 5)}-${dataToUpdate.end_time?.substring(0, 5)}`;
      }
      
      await onUpdate(id, dataToUpdate);
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
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
    if (window.confirm(`Are you sure you want to delete this template?`)) {
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
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    const dayA = DAYS_OF_WEEK.indexOf(a.day_of_week as DayOfWeek);
    const dayB = DAYS_OF_WEEK.indexOf(b.day_of_week as DayOfWeek);
    return dayA - dayB;
  });

  // Generate template name based on day and time
  const getTemplateName = (template: ShiftTemplate) => {
    return template.name || `${template.day_of_week} ${template.start_time.substring(0, 5)}-${template.end_time.substring(0, 5)}`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Day</TableHead>
              <TableHead className="text-left">Start Time</TableHead>
              <TableHead className="text-left">End Time</TableHead>
              <TableHead className="text-left">Staff</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No shift templates found. Add a template to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedTemplates.map((template) => (
                <TableRow key={template.id}>
                  {/* Day of Week */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Select 
                        value={editData.day_of_week} 
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
                      <div 
                        className="cursor-pointer hover:bg-muted/20 p-2 rounded flex items-center gap-2" 
                        onClick={() => startEditing(template)}
                      >
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
                        value={editData.start_time?.substring(0, 5) || ''} 
                        onChange={(e) => handleChange('start_time', e.target.value + ':00')} 
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted/20 p-2 rounded flex items-center gap-2" 
                        onClick={() => startEditing(template)}
                      >
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
                        value={editData.end_time?.substring(0, 5) || ''} 
                        onChange={(e) => handleChange('end_time', e.target.value + ':00')} 
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted/20 p-2 rounded flex items-center gap-2" 
                        onClick={() => startEditing(template)}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(template.end_time)}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Staff */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <Select 
                        value={editData.employee_id || "none"} 
                        onValueChange={(value) => handleChange('employee_id', value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select staff (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {activeStaffMembers.length === 0 ? (
                            <SelectItem value="none" disabled>No active staff available</SelectItem>
                          ) : (
                            activeStaffMembers.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.first_name} {staff.last_name} ({staff.role})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-muted/20 p-2 rounded flex items-center gap-2" 
                        onClick={() => startEditing(template)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getStaffName(template)}
                      </div>
                    )}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell>
                    {editingRow === template.id ? (
                      <div className="flex justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => saveEdits(template.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Save changes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={cancelEdits}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancel</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(template)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleClone(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(template)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
