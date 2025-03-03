
import React, { useState } from 'react';
import { Location } from '../types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ShieldAlert } from 'lucide-react';
import { EditLocationDialog } from './edit-location-dialog';
import { DeleteLocationDialog } from './delete-location-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LocationsTableProps {
  locations: Location[];
  isLoading: boolean;
  onUpdate: (id: string, data: Partial<Location>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function LocationsTable({ 
  locations, 
  isLoading, 
  onUpdate, 
  onDelete,
  canEdit = true,
  canDelete = true
}: LocationsTableProps) {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No locations found. {canEdit ? "Add a location to get started." : ""}
                </TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.address || '—'}</TableCell>
                  <TableCell className="text-right">
                    {canEdit ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingLocation(location)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                            >
                              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You don't have permission to edit locations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {canDelete ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingLocation(location)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled
                            >
                              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>You don't have permission to delete locations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingLocation && (
        <EditLocationDialog
          location={editingLocation}
          open={!!editingLocation}
          onOpenChange={(open) => !open && setEditingLocation(null)}
          onUpdate={onUpdate}
        />
      )}

      {deletingLocation && (
        <DeleteLocationDialog
          location={deletingLocation}
          open={!!deletingLocation}
          onOpenChange={(open) => !open && setDeletingLocation(null)}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
