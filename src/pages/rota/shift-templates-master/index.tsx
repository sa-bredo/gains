
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { ShiftTemplateMaster, Location } from '../shift-templates/types';
import { ShiftTemplateMasterTable } from './components/shift-template-master-table';
import { NewTemplateVersionDialog } from './components/new-template-version-dialog';
import { useCompany } from "@/contexts/CompanyContext";
import { useShiftService } from '../shifts/services/shift-service';

export default function ShiftTemplatesMasterPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [templateMasters, setTemplateMasters] = useState<ShiftTemplateMaster[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentCompany } = useCompany();
  const shiftService = useShiftService();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      if (!currentCompany) {
        console.log('No company selected, cannot fetch data');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching data for company:', currentCompany.id);
      
      // Fetch both locations and template masters
      const [locationsData, templateMastersData] = await Promise.all([
        shiftService.fetchLocations(),
        fetchShiftTemplateVersions()
      ]);
      
      console.log('Fetched locations:', locationsData.length);
      console.log('Fetched template masters:', templateMastersData.length);
      
      setLocations(locationsData);
      setTemplateMasters(templateMastersData);
    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Failed to load data",
        description: "There was a problem loading the template data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShiftTemplateVersions = async () => {
    try {
      if (!currentCompany) {
        console.log('No company selected, cannot fetch templates');
        return [];
      }
      
      console.log('Fetching shift templates for company:', currentCompany.id);
      
      // First get locations for this company
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name')
        .eq('company_id', currentCompany.id);
        
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
        throw locationsError;
      }
      
      console.log('Locations found:', locationsData?.length || 0);
      
      if (!locationsData || locationsData.length === 0) {
        return [];
      }
      
      const locationIds = locationsData.map(loc => loc.id);
      console.log('Location IDs:', locationIds);
      
      // Then get templates for these locations
      const { data, error } = await supabase
        .from('shift_templates')
        .select(`
          id,
          location_id,
          locations:location_id (id, name, company_id),
          version,
          created_at
        `)
        .in('location_id', locationIds)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shift templates:', error);
        throw error;
      }
      
      console.log('Raw templates found:', data?.length || 0, data);
      
      // Only process templates that belong to the current company
      const filteredData = data?.filter(template => 
        template.locations?.company_id === currentCompany.id
      );
      
      console.log('Filtered templates:', filteredData?.length || 0);
      
      // Group templates by location and version
      const uniqueTemplates = new Map<string, ShiftTemplateMaster>();
      
      filteredData?.forEach(template => {
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
      
      console.log('Unique template masters after grouping:', templates.length, templates);
      return templates;
    } catch (error) {
      console.error('Error in fetchShiftTemplateVersions:', error);
      toast({
        title: "Failed to load shift templates",
        description: "There was a problem loading the template data.",
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    if (currentCompany) {
      console.log('Company changed, fetching data');
      fetchData();
    } else {
      console.log('No company selected yet');
    }
  }, [currentCompany]);

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
        console.log('Cloning templates for location', locationId, 'from version', version, 'to version', newVersion);
        
        // Create new templates but without the id field
        const newTemplates = templatesData.map(template => {
          // Destructure to remove the id field
          const { id, ...templateWithoutId } = template;
          
          // Return a new object with the updated version
          return {
            ...templateWithoutId,
            version: newVersion,
            created_at: new Date().toISOString()
          };
        });
        
        console.log('New templates to insert:', newTemplates);
        
        const { error: insertError } = await supabase
          .from('shift_templates')
          .insert(newTemplates);
          
        if (insertError) {
          console.error('Error inserting new templates:', insertError);
          throw insertError;
        }
        
        toast({
          title: "Templates cloned successfully",
          description: `Created version ${newVersion} based on version ${version}`,
        });
        
        fetchData();
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
  );
}
