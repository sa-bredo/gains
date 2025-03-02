
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, MapPin, UserRound } from 'lucide-react';
import { ShiftTemplate } from '../types';
import { Skeleton } from '@/components/ui/skeleton';
import { EditShiftTemplateDialog } from './edit-shift-template-dialog';
import { DeleteShiftTemplateDialog } from './delete-shift-template-dialog';
import { useTeamMembers } from '@/pages/team/hooks/useTeamMembers';
import { TeamMember } from '@/pages/team/types';

interface ShiftTemplatesTableProps {
  templates: ShiftTemplate[];
  locations: { id: string; name: string }[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ShiftTemplatesTable({
  templates,
  locations,
  isLoading,
  onUpdate,
  onDelete,
}: ShiftTemplatesTableProps) {
  const [editTemplate, setEditTemplate] = useState<ShiftTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<ShiftTemplate | null>(null);
  const [activeStaff, setActiveStaff] = useState<TeamMember[]>([]);
  const { fetchActiveStaff } = useTeamMembers();
  
  useEffect(() => {
    const getActiveStaff = async () => {
      try {
        const staff = await fetchActiveStaff();
        setActiveStaff(staff);
      } catch (error) {
        console.error("Error fetching active staff:", error);
      }
    };
    
    getActiveStaff();
  }, [fetchActiveStaff]);

  const getLocationName = (locationId: string) => {
    return locations.find(location => location.id === locationId)?.name || 'Unknown Location';
  };

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Unassigned';
    const employee = activeStaff.find(emp => emp.id === employeeId);
    return employee 
      ? `${employee.first_name} ${employee.last_name}` 
      : 'Unknown Employee';
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return time;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No shift templates yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first shift template to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableCaption>List of all shift templates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.day_of_week}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {getLocationName(template.location_id)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatTime(template.start_time)} - {formatTime(template.end_time)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  {getEmployeeName(template.employee_id)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTemplate(template)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editTemplate && (
        <EditShiftTemplateDialog
          open={!!editTemplate}
          onOpenChange={(open) => !open && setEditTemplate(null)}
          onUpdate={onUpdate}
          template={editTemplate}
          locations={locations}
        />
      )}

      {deleteTemplate && (
        <DeleteShiftTemplateDialog
          open={!!deleteTemplate}
          onOpenChange={(open) => !open && setDeleteTemplate(null)}
          onDelete={() => {
            if (deleteTemplate) {
              onDelete(deleteTemplate.id);
              setDeleteTemplate(null);
            }
          }}
          template={deleteTemplate}
        />
      )}
    </>
  );
}
