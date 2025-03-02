
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { ShiftTemplateMaster, Location } from '../shift-templates/types';
import { ShiftTemplateMasterTable } from './components/shift-template-master-table';
import { NewTemplateVersionDialog } from './components/new-template-version-dialog';

export default function ShiftTemplatesMasterPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch shift template masters (grouped by location and with latest version)
  const fetchShiftTemplateMasters = async () => {
    try {
      setIsLoading(true);
      
      // Using raw query instead of RPC to avoid TypeScript issues
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          location_id,
          locations:location_id (id, name),
          version,
          created_at
        `)
        .order('version', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process the data to group by location with the latest version
      const locationMap = new Map<string, ShiftTemplateMaster>();
      
      data?.forEach(template => {
        const locationId = template.location_id;
        if (!locationMap.has(locationId)) {
          locationMap.set(locationId, {
            location_id: locationId,
            location_name: template.locations?.name || 'Unknown',
            latest_version: template.version,
            created_at: template.created_at,
          });
        }
      });
      
      setTemplateMasters(Array.from(locationMap.values()));
    } catch (error) {
      console.error('Error fetching shift template masters:', error);
      toast({
        title: "Failed to load shift templates",
        description: "There was a problem loading the template data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch locations
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
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  // Load initial data
  useEffect(() => {
    fetchLocations();
    fetchShiftTemplateMasters();
  }, []);

  // Handle going to template details
  const handleViewTemplates = (locationId: string, version: number) => {
    navigate(`/rota/shift-templates?location=${locationId}&version=${version}`);
  };

  // Handle creating a new template version
  const handleCreateNewVersion = (locationId: string, newVersion: number) => {
    navigate(`/rota/shift-templates?location=${locationId}&version=${newVersion}&new=true`);
  };

  return (
    <SidebarProvider>
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
              <h1 className="text-3xl font-bold">Shift Templates</h1>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
                disabled={locations.length === 0}
              >
                <PlusIcon className="h-4 w-4" />
                New Shift Template
              </Button>
            </div>

            {locations.length === 0 && !isLoading && (
              <div className="bg-muted/50 p-4 rounded-md mb-6">
                <p className="text-sm">
                  You need to add locations before creating shift templates. Go to Settings &gt; Locations to add them.
                </p>
              </div>
            )}
            
            <ShiftTemplateMasterTable 
              templateMasters={templateMasters}
              isLoading={isLoading}
              onViewTemplates={handleViewTemplates}
            />
            
            <NewTemplateVersionDialog 
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              locations={locations}
              onConfirm={handleCreateNewVersion}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
