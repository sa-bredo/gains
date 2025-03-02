
import React, { useState } from 'react';
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Edit, Copy, CalendarPlus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { AddShiftDialog } from '../../shifts/components/add-shift-dialog';

interface ShiftTemplateMasterTableProps {
  templateMasters: ShiftTemplateMaster[];
  isLoading: boolean;
  onViewTemplates: (locationId: string, version: number) => void;
  onCloneTemplates: (locationId: string, version: number) => void;
}

export function ShiftTemplateMasterTable({ 
  templateMasters, 
  isLoading, 
  onViewTemplates,
  onCloneTemplates
}: ShiftTemplateMasterTableProps) {
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{locationId: string, version: number} | null>(null);

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Handle opening the add shift dialog with prefilled location and version
  const handleAddShift = (locationId: string, version: number) => {
    setSelectedTemplate({ locationId, version });
    setAddShiftDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : templateMasters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No shift templates found. Create a new template to get started.
                </TableCell>
              </TableRow>
            ) : (
              templateMasters.map((master) => (
                <TableRow key={`${master.location_id}-${master.version}`}>
                  <TableCell>{master.location_name}</TableCell>
                  <TableCell>v{master.version}</TableCell>
                  <TableCell>{formatDate(master.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onViewTemplates(master.location_id, master.version)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Templates</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onCloneTemplates(master.location_id, master.version)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clone Templates</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddShift(master.location_id, master.version)}
                            >
                              <CalendarPlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add Shifts</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Shift Dialog with prefilled values */}
      {selectedTemplate && (
        <AddShiftDialog
          open={addShiftDialogOpen}
          onOpenChange={setAddShiftDialogOpen}
          defaultLocationId={selectedTemplate.locationId}
          defaultVersion={selectedTemplate.version}
        />
      )}
    </div>
  );
}
