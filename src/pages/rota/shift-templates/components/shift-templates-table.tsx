
import React, { useState } from 'react';
import { ShiftTemplate, Location, StaffMember, DAYS_OF_WEEK } from '../types';
import { Button } from '@/components/ui/button';
import { Copy, Pencil, Trash2, Clock, CalendarIcon, MapPin, User } from 'lucide-react';
import { EditShiftTemplateDialog } from './edit-shift-template-dialog';
import { DeleteShiftTemplateDialog } from './delete-shift-template-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ShiftTemplate | null>(null);

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
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sortedTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No shift templates found. Add a template to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {template.day_of_week}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatTime(template.start_time)} - {formatTime(template.end_time)}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {template.locations?.name || '—'}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {getStaffName(template)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onClone(template)}
                      title="Clone template"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Clone</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTemplate(template)}
                      title="Edit template"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingTemplate(template)}
                      title="Delete template"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingTemplate && (
        <EditShiftTemplateDialog
          template={editingTemplate}
          locations={locations}
          staffMembers={staffMembers}
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          onUpdate={onUpdate}
        />
      )}

      {deletingTemplate && (
        <DeleteShiftTemplateDialog
          template={deletingTemplate}
          open={!!deletingTemplate}
          onOpenChange={(open) => !open && setDeletingTemplate(null)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
