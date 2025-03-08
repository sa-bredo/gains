
import React, { useState } from 'react';
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
import { Copy, Edit, MapPin } from 'lucide-react';
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Skeleton } from '@/components/ui/skeleton';
import { CloneTemplateVersionDialog } from './clone-template-version-dialog';

interface ShiftTemplateMasterTableProps {
  templateMasters: ShiftTemplateMaster[];
  isLoading: boolean;
  locations: { id: string; name: string }[];
  onViewTemplates: (locationId: string, version: number) => void;
  onCloneTemplates: (sourceLocationId: string, targetLocationId: string, version: number) => Promise<void>;
}

export function ShiftTemplateMasterTable({
  templateMasters,
  isLoading,
  locations,
  onViewTemplates,
  onCloneTemplates,
}: ShiftTemplateMasterTableProps) {
  const [cloneTemplate, setCloneTemplate] = useState<{locationId: string, version: number} | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (templateMasters.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">No shift templates yet</h3>
        <p className="text-muted-foreground mt-1">
          Create your first shift template to get started.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Table>
        <TableCaption>List of all shift template masters.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templateMasters.map((master) => (
            <TableRow key={`${master.location_id}-${master.version}`}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {master.location_name}
                </div>
              </TableCell>
              <TableCell>{master.version}</TableCell>
              <TableCell>{formatDate(master.created_at)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTemplates(master.location_id, master.version)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    View & Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCloneTemplate({ 
                      locationId: master.location_id, 
                      version: master.version 
                    })}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {cloneTemplate && (
        <CloneTemplateVersionDialog
          open={!!cloneTemplate}
          onOpenChange={(open) => !open && setCloneTemplate(null)}
          onConfirm={onCloneTemplates}
          locations={locations}
          sourceLocationId={cloneTemplate.locationId}
          sourceVersion={cloneTemplate.version}
        />
      )}
    </>
  );
}
