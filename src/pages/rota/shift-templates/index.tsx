import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppSidebar } from '@/components/sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShiftTemplatesTable } from './components/shift-templates-table';
import { useCompany } from '@/contexts/CompanyContext';
import { AddShiftTemplateDialog } from './components/add-shift-template-dialog';
import { useShiftService } from '../shifts/services/shift-service';
import { Location, StaffMember } from './types';

function ShiftTemplatesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAddTemplateDialogOpen, setIsAddTemplateDialogOpen] = useState(false);
  const { currentCompany } = useCompany();
  const shiftService = useShiftService();
  const [locationIdFilter, setLocationIdFilter] = useState<string | null>(null);
  const [versionFilter, setVersionFilter] = useState<number | null>(null);

  // Query and get data from URL
  const searchParams = new URLSearchParams(useLocation().search);
  const locationId = searchParams.get('location');
  const version = searchParams.get('version') ? Number(searchParams.get('version')) : undefined;

  // Fetch shift templates with react-query
  const { data: shiftTemplates, isLoading, error, refetch } = useQuery({
    queryKey: ['shiftTemplates', currentCompany?.id, locationIdFilter, versionFilter],
    queryFn: () => shiftService.fetchShiftTemplates(locationIdFilter, versionFilter),
    enabled: !!currentCompany,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Fetch locations with react-query
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations', currentCompany?.id],
    queryFn: () => shiftService.fetchLocations(),
    enabled: !!currentCompany,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Fetch staff members with react-query
  const { data: staffMembers, isLoading: isLoadingStaff } = useQuery({
    queryKey: ['staffMembers', currentCompany?.id],
    queryFn: () => shiftService.fetchStaffMembers(),
    enabled: !!currentCompany,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching shift templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shift templates. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (locationId) {
      setLocationIdFilter(locationId);
    }
    if (version) {
      setVersionFilter(version);
    }
  }, [locationId, version]);

  const handleAddTemplate = async (values: any) => {
    try {
      await shiftService.addShiftTemplate(values);
      toast({
        title: 'Success',
        description: 'Shift template added successfully.',
      });
      setIsAddTemplateDialogOpen(false);
      refetch();
    } catch (err) {
      console.error('Error adding shift template:', err);
      toast({
        title: 'Error',
        description: 'Failed to add shift template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = async (templateId: string, values: any) => {
    try {
      await shiftService.updateShiftTemplate(templateId, values);
      toast({
        title: 'Success',
        description: 'Shift template updated successfully.',
      });
      refetch();
    } catch (err) {
      console.error('Error updating shift template:', err);
      toast({
        title: 'Error',
        description: 'Failed to update shift template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await shiftService.deleteShiftTemplate(templateId);
      toast({
        title: 'Success',
        description: 'Shift template deleted successfully.',
      });
      refetch();
    } catch (err) {
      console.error('Error deleting shift template:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete shift template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Rota / Shift Templates</span>
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Shift Templates</h1>
            <Button onClick={() => setIsAddTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift Template
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading shift templates...</p>
            </div>
          ) : (
            <ShiftTemplatesTable
              shiftTemplates={shiftTemplates || []}
              locations={locations || []}
              staffMembers={staffMembers || []}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          )}
          <AddShiftTemplateDialog
            open={isAddTemplateDialogOpen}
            onOpenChange={setIsAddTemplateDialogOpen}
            onConfirm={handleAddTemplate}
            locations={locations || []}
            staffMembers={staffMembers || []}
          />
        </div>
      </SidebarInset>
    </div>
  );
}

export default ShiftTemplatesPage;
