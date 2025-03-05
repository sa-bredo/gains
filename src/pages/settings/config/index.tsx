import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfigTable } from "./components/config-table";
import { AddConfigDialog } from "./components/add-config-dialog";
import { EditConfigDialog } from "./components/edit-config-dialog";
import { DeleteConfigDialog } from "./components/delete-config-dialog";
import { ConfigItem } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/contexts/CompanyContext";

export default function ConfigPage() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ConfigItem | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<ConfigItem | null>(null);
  const { currentCompany } = useCompany();

  const fetchConfigItems = async () => {
    setIsLoading(true);
    try {
      if (!currentCompany) {
        console.log('No company selected');
        setConfigItems([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching config for company:', currentCompany.id);
      
      // Use only the fields that exist in the config table
      const { data, error } = await supabase
        .from('config')
        .select('id, key, value, display_name, created_at, updated_at')
        .eq('company_id', currentCompany.id)
        .order('key');

      if (error) {
        throw error;
      }
      
      console.log('Fetched config items:', data);
      
      // Map the data to match the ConfigItem type
      const formattedData: ConfigItem[] = data.map(item => ({
        id: item.id,
        key: item.key,
        value: item.value,
        display_name: item.display_name,
        company_id: currentCompany.id, // Use the current company ID
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setConfigItems(formattedData);
    } catch (error) {
      console.error('Error fetching config items:', error);
      toast.error('Failed to load configuration items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCompany) {
      fetchConfigItems();
    }
  }, [currentCompany]);

  const handleEdit = (config: ConfigItem) => {
    setEditingConfig(config);
  };

  const handleDelete = (config: ConfigItem) => {
    setDeletingConfig(config);
  };

  const handleAddSuccess = () => {
    fetchConfigItems();
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = async () => {
    await fetchConfigItems();
    setEditingConfig(null);
  };

  const handleDeleteSuccess = async () => {
    await fetchConfigItems();
    setDeletingConfig(null);
  };

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Settings / Configuration</span>
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Configuration</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Config
            </Button>
          </div>
          <ConfigTable 
            configItems={configItems}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <AddConfigDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSuccess={handleAddSuccess}
          />
          {editingConfig && (
            <EditConfigDialog
              open={!!editingConfig}
              onOpenChange={(open) => !open && setEditingConfig(null)}
              onSuccess={handleEditSuccess}
              config={editingConfig}
            />
          )}
          {deletingConfig && (
            <DeleteConfigDialog
              open={!!deletingConfig}
              onOpenChange={(open) => !open && setDeletingConfig(null)}
              onSuccess={handleDeleteSuccess}
              config={deletingConfig}
            />
          )}
        </div>
      </SidebarInset>
    </div>
  );
}
