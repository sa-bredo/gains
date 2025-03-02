
import React from 'react';
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Edit, Copy } from 'lucide-react';
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
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
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
              <TableHead className="w-[120px]">Actions</TableHead>
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
                    </div>
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
