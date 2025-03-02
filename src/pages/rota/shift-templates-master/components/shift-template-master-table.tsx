
import React from 'react';
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
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
}

export function ShiftTemplateMasterTable({ 
  templateMasters, 
  isLoading, 
  onViewTemplates
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
              <TableHead className="text-left">Location</TableHead>
              <TableHead className="text-left">Latest Version</TableHead>
              <TableHead className="text-left">Created</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
                <TableRow key={`${master.location_id}-${master.latest_version}`}>
                  <TableCell className="font-medium">{master.location_name}</TableCell>
                  <TableCell>v{master.latest_version}</TableCell>
                  <TableCell>{formatDate(master.created_at)}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewTemplates(master.location_id, master.latest_version)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Templates</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
