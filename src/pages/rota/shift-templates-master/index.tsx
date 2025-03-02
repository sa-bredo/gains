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

  const fetchShiftTemplateVersions = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          location_id,
          locations:location_id (id, name),
          version,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const uniqueTemplates = new Map<string, ShiftTemplateMaster>();
      
      data?.forEach(template => {
        const locationId = template.location_id;
        const version = template.version;
        const key = `${locationId}-${version}`;
        
        if (!uniqueTemplates.has(key)) {
          uniqueTemplates.set(key, {
            location_id: locationId,
            location_name: template.locations?.name || 'Unknown',
            version: version,
            created_at: template.created_at,
          });
        }
      });
      
      const templates = Array.from(uniqueTemplates.values());
      templates.sort((a, b) => {
        if (a.location_name < b.location_name) return -1;
        if (a.location_name > b.location_name) return 1;
        return b.version - a.version;
      });
      
      setTemplateMasters(templates);
    } catch (error) {
      console.error('Error fetching shift templates:', error);
      toast({
        title: "Failed to load shift templates",
        description: "There was a problem loading the template data.",
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
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast({
        title: "Failed to load locations",
        description: "There was a problem loading the locations data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchShiftTemplateVersions();
  }, []);

  const handleViewTemplates = (locationId: string, version: number) => {
    navigate(`/rota/shift-templates?location=${locationId}&version=${version}`);
  };

  const handleCreateNewVersion = (locationId: string, newVersion: number) => {
    navigate(`/rota/shift-templates?location=${locationId}&version=${newVersion}&new=true`);
  };

  const handleCloneTemplates = async (locationId: string, version: number) => {
    try {
      const { data: versionData, error: versionError } = await supabase
        .from('shift_templates')
        .select('version')
        .eq('location_id', locationId)
        .order('version', { ascending: false })
        .limit(1);
      
      if (versionError) throw versionError;
      
      const newVersion = versionData && versionData.length > 0 
        ? versionData[0].version + 1 
        : 1;
        
      const { data: templatesData, error: templatesError } = await supabase
        .from('shift_templates')
        .select('*')
        .eq('location_id', locationId)
        .eq('version', version);
        
      if (templatesError) throw templatesError;
      
      if (templatesData && templatesData.length > 0) {
        const newTemplates = templatesData.map(template => ({
          ...template,
          id: undefined,
          version: newVersion,
          created_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('shift_templates')
          .insert(newTemplates);
          
        if (insertError) throw insertError;
        
        toast({
          title: "Templates cloned successfully",
          description: `Created version ${newVersion} based on version ${version}`,
        });
        
        fetchShiftTemplateVersions();
      } else {
        toast({
          title: "No templates to clone",
          description: "The selected version has no templates.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error cloning templates:', error);
      toast({
        title: "Failed to clone templates",
        description: "There was a problem cloning the templates.",
        variant: "destructive",
      });
    }
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
              onCloneTemplates={handleCloneTemplates}
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
