import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlusIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { ShiftTemplate, Location } from './types';
import { ShiftTemplatesTable } from './components/shift-templates-table';
import { AddShiftTemplateDialog } from './components/add-shift-template-dialog';
import { EditShiftTemplateDialog } from './components/edit-shift-template-dialog';
import { DeleteShiftTemplateDialog } from './components/delete-shift-template-dialog';
import { CloneShiftTemplateDialog } from './components/clone-shift-template-dialog';
import { useCompany } from "@/contexts/CompanyContext";

export default function ShiftTemplatesPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const locationId = queryParams.get('location');
  const versionParam = queryParams.get('version');
  const isNewTemplate = queryParams.get('new') === 'true';
  
  const version = versionParam ? parseInt(versionParam, 10) : null;
  
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [staffMembers, setStaffMembers] = useState<ShiftMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locationId);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(version);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const fetchShiftTemplates = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('shift_templates')
        .select(`
          *,
          locations:location_id (id, name),
          employees:employee_id (id, first_name, last_name, role, email)
        `);
      
      if (selectedLocationId) {
        query = query.eq('location_id', selectedLocationId);
      }
      
      if (selectedVersion) {
        query = query.eq('version', selectedVersion);
      }
      
      const { data, error } = await query
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      const dayOrder = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7
      };
      
      const sortedData = (data || []).sort((a, b) => {
        const dayDiff = dayOrder[a.day_of_week] - dayOrder[b.day_of_week];
        if (dayDiff !== 0) {
          return dayDiff;
        }
        
        return a.start_time.localeCompare(b.start_time);
      });
      
      setShiftTemplates(sortedData as ShiftTemplate[] || []);
    } catch (error) {
      console.error('Error fetching shift templates:', error);
      toast({
        title: "Failed to load shift templates",
        description: "There was a problem loading the shift templates data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setLocations(data || []);
      
      if (selectedLocationId) {
        const currentLoc = data?.find(loc => loc.id === selectedLocationId) || null;
        setCurrentLocation(currentLoc);
      }
      
      if (!selectedLocationId && data && data.length > 0) {
        setSelectedLocationId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .in('role', ['Manager', 'Front Of House', 'Instructor'])
        .order('first_name');
      
      if (error) {
        throw error;
      }
      
      setStaffMembers(data || []);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast({
        title: "Failed to load staff members",
        description: "There was a problem loading the staff members data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    Promise.all([
      fetchLocations(),
      fetchStaffMembers()
    ]).then(() => {
      fetchShiftTemplates();
    });
    
    if (isNewTemplate) {
      setIsDialogOpen(true);
    }
  }, [selectedLocationId, selectedVersion, isNewTemplate]);

  const addShiftTemplate = async (templateData: ShiftTemplateFormValues): Promise<void> => {
    try {
      setIsUpdating(true);
      
      const dataToAdd = {
        ...templateData,
        location_id: templateData.location_id || selectedLocationId,
        version: selectedVersion || 1,
        name: templateData.name || `${templateData.day_of_week} ${templateData.start_time}-${templateData.end_time}`
      };
      
      const { locations, employees, ...dataToInsert } = dataToAdd as any;
      
      const { data, error } = await supabase
        .from('shift_templates')
        .insert(dataToInsert)
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Shift template added",
        description: "The shift template has been successfully added.",
      });
      
      await fetchShiftTemplates();
    } catch (error) {
      console.error('Error adding shift template:', error);
      toast({
        title: "Failed to add shift template",
        description: "There was a problem adding the shift template.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateShiftTemplate = async (id: string, templateData: Partial<ShiftTemplate>) => {
    try {
      setIsUpdating(true);
      
      const { locations, employees, ...dataToUpdate } = templateData;
      
      const { error } = await supabase
        .from('shift_templates')
        .update(dataToUpdate)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Shift template updated",
        description: "The shift template has been successfully updated.",
      });
      
      await fetchShiftTemplates();
    } catch (error) {
      console.error('Error updating shift template:', error);
      toast({
        title: "Failed to update shift template",
        description: "There was a problem updating the shift template.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteShiftTemplate = async (id: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('shift_templates')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Shift template deleted",
        description: "The shift template has been successfully deleted.",
      });
      
      await fetchShiftTemplates();
    } catch (error) {
      console.error('Error deleting shift template:', error);
      toast({
        title: "Failed to delete shift template",
        description: "There was a problem deleting the shift template.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const cloneShiftTemplate = async (template: ShiftTemplate, newLocationId: string) => {
    try {
      setIsUpdating(true);
      
      const { id, ...templateWithoutId } = template;
      
      const clonedTemplate = {
        ...templateWithoutId,
        location_id: newLocationId,
        name: `Copy of ${template.name || ''}`.trim() || `Copy of ${template.day_of_week} ${template.start_time}-${template.end_time}`,
      };
      
      console.log('Cloning template with data:', clonedTemplate);
      
      const { data, error } = await supabase
        .from('shift_templates')
        .insert(clonedTemplate)
        .select();
      
      if (error) {
        console.error('Supabase error when cloning template:', error);
        throw error;
      }
      
      toast({
        title: "Shift template cloned",
        description: "The shift template has been successfully cloned.",
      });
      
      await fetchShiftTemplates();
    } catch (error) {
      console.error('Error cloning shift template:', error);
      toast({
        title: "Failed to clone shift template",
        description: "There was a problem cloning the shift template.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBackToMaster = () => {
    navigate('/rota/shift-templates-master');
  };

  const getPageTitle = () => {
    if (currentLocation && selectedVersion) {
      return `${currentLocation.name} Templates (v${selectedVersion})`;
    }
    return 'Shift Templates';
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleBackToMaster}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
              disabled={isUpdating || locations.length === 0 || !selectedLocationId || !selectedVersion}
            >
              <PlusIcon className="h-4 w-4" />
              Add Shift Template
            </Button>
          </div>

          {locations.length === 0 && !isLoading && (
            <div className="bg-muted/50 p-4 rounded-md mb-6">
              <p className="text-sm">
                You need to add locations before creating shift templates. Go to Settings &gt; Locations to add them.
              </p>
            </div>
          )}
          
          <ShiftTemplatesTable 
            templates={shiftTemplates}
            locations={locations}
            staffMembers={staffMembers as any}
            isLoading={isLoading || isUpdating}
            onUpdate={updateShiftTemplate}
            onDelete={deleteShiftTemplate}
            onClone={cloneShiftTemplate}
            selectedLocationId={selectedLocationId}
          />
          
          <AddShiftTemplateDialog 
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onAdd={addShiftTemplate}
            locations={locations}
            selectedLocationId={selectedLocationId}
          />
        </div>
      </SidebarInset>
    </div>
  );
}
