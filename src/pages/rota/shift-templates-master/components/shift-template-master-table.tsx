
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Eye, Copy, Trash } from 'lucide-react';
import { ShiftTemplateMaster, Location } from '../../shift-templates/types';
import { format } from 'date-fns';
import { CloneTemplateVersionDialog } from './clone-template-version-dialog';
import { DeleteTemplateMasterDialog } from './delete-template-master-dialog';

interface ShiftTemplateMasterTableProps {
  templateMasters: ShiftTemplateMaster[];
  locations: Location[];
  isLoading: boolean;
  onViewTemplates: (locationId: string, version: number) => void;
  onCloneTemplates: (sourceLocationId: string, targetLocationId: string, version: number) => Promise<void>;
  onDeleteTemplate?: (locationId: string, version: number) => Promise<void>;
}

export function ShiftTemplateMasterTable({
  templateMasters,
  locations,
  isLoading,
  onViewTemplates,
  onCloneTemplates,
  onDeleteTemplate
}: ShiftTemplateMasterTableProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplateMaster | null>(null);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCloneClick = (template: ShiftTemplateMaster) => {
    setSelectedTemplate(template);
    setIsCloneDialogOpen(true);
  };
  
  const handleDeleteClick = (template: ShiftTemplateMaster) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (templateMasters.length === 0) {
    return (
      <div className="bg-muted/50 p-8 rounded-md flex justify-center items-center">
        <p className="text-muted-foreground text-center">
          No shift templates found. Click "New Shift Template" to create your first template.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templateMasters.map((template) => (
            <TableRow key={`${template.location_id}-${template.version}`}>
              <TableCell className="font-medium">{template.location_name}</TableCell>
              <TableCell>{template.version}</TableCell>
              <TableCell>
                {template.created_at && format(new Date(template.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewTemplates(template.location_id, template.version)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCloneClick(template)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Clone
                </Button>
                {onDeleteTemplate && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteClick(template)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedTemplate && (
        <>
          <CloneTemplateVersionDialog 
            open={isCloneDialogOpen} 
            onOpenChange={setIsCloneDialogOpen}
            sourceLocationId={selectedTemplate.location_id}
            sourceVersion={selectedTemplate.version}
            locations={locations}
            onConfirm={onCloneTemplates}
          />
          
          {onDeleteTemplate && (
            <DeleteTemplateMasterDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              templateMaster={selectedTemplate}
              onDelete={onDeleteTemplate}
            />
          )}
        </>
      )}
    </>
  );
}
