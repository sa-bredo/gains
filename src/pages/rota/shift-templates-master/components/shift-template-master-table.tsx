import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShiftTemplateMaster } from '../../shift-templates/types';
import { Button } from '@/components/ui/button';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { CloneTemplateVersionDialog } from './clone-template-version-dialog';
import { DeleteTemplateMasterDialog } from './delete-template-master-dialog';
import { useToast } from '@/hooks/use-toast';
import { useShiftTemplateMasterService } from '../services/shift-template-master-service';
import { useNavigate } from 'react-router-dom';
import { Location } from '../../shift-templates/types';

interface ShiftTemplateMasterTableProps {
  templateMasters: ShiftTemplateMaster[];
}

export function ShiftTemplateMasterTable({ templateMasters }: ShiftTemplateMasterTableProps) {
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplateMaster, setSelectedTemplateMaster] = useState<ShiftTemplateMaster | null>(null);
  const { toast } = useToast();
  const shiftTemplateMasterService = useShiftTemplateMasterService();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<Location[]>([]);

  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await shiftTemplateMasterService.fetchLocations();
        setLocations(locationsData);
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load locations. Please try again later.',
          variant: 'destructive',
        });
      }
    };

    fetchLocations();
  }, [shiftTemplateMasterService, toast]);

  const handleCloneDialogOpen = (templateMaster: ShiftTemplateMaster) => {
    setSelectedTemplateMaster(templateMaster);
    setCloneDialogOpen(true);
  };

  const handleDeleteDialogOpen = (templateMaster: ShiftTemplateMaster) => {
    setSelectedTemplateMaster(templateMaster);
    setDeleteDialogOpen(true);
  };

  const handleCloneTemplate = async (
    sourceLocationId: string,
    sourceVersion: number,
    targetLocationId: string
  ) => {
    try {
      await shiftTemplateMasterService.cloneTemplateVersion(
        sourceLocationId,
        sourceVersion,
        targetLocationId
      );
      toast({
        title: 'Success',
        description: 'Template version cloned successfully.',
      });
      setCloneDialogOpen(false);
    } catch (error) {
      console.error('Failed to clone template version:', error);
      toast({
        title: 'Error',
        description: 'Failed to clone template version. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (locationId: string, version: number) => {
    try {
      await shiftTemplateMasterService.deleteTemplateVersion(locationId, version);
      toast({
        title: 'Success',
        description: 'Template version deleted successfully.',
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete template version:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template version. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = (templateMaster: ShiftTemplateMaster) => {
    navigate(`/rota/shift-templates?location=${templateMaster.location_id}&version=${templateMaster.version}`);
  };

  // Component rendering
  return (
    <div className="space-y-4">
      <Table>
        <TableCaption>Shift Template Masters</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Version</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templateMasters.map((templateMaster) => (
            <TableRow key={`${templateMaster.location_id}-${templateMaster.version}`}>
              <TableCell>{templateMaster.location_name}</TableCell>
              <TableCell>{templateMaster.version}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => handleEditTemplate(templateMaster)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCloneDialogOpen(templateMaster)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteDialogOpen(templateMaster)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {cloneDialogOpen && selectedTemplateMaster && (
        <CloneTemplateVersionDialog
          open={cloneDialogOpen}
          onOpenChange={setCloneDialogOpen}
          sourceLocationId={selectedTemplateMaster.location_id}
          sourceVersion={selectedTemplateMaster.version}
          targetLocations={locations}
          onClone={handleCloneTemplate}
        />
      )}

      {deleteDialogOpen && selectedTemplateMaster && (
        <DeleteTemplateMasterDialog
          templateMaster={selectedTemplateMaster}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={handleDeleteTemplate}
        />
      )}
    </div>
  );
}
