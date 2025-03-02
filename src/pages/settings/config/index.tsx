
import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { Button } from '@/components/ui/button';
import { ConfigItem } from './types';
import { ConfigTable } from './components/config-table';
import { AddConfigDialog } from './components/add-config-dialog';
import { EditConfigDialog } from './components/edit-config-dialog';
import { DeleteConfigDialog } from './components/delete-config-dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ConfigPage() {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigItem | null>(null);

  // Load config items
  const fetchConfigItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;

      setConfigItems(data as ConfigItem[]);
    } catch (error) {
      console.error('Error fetching config items:', error);
      toast.error('Failed to load configurations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigItems();
  }, []);

  // Handler for edit button
  const handleEdit = (config: ConfigItem) => {
    setSelectedConfig(config);
    setEditDialogOpen(true);
  };

  // Handler for delete button
  const handleDelete = (config: ConfigItem) => {
    setSelectedConfig(config);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <AppSidebar className="hidden md:flex" />
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Configuration</h2>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Config
              </Button>
            </div>
          </div>
          
          <ConfigTable 
            configItems={configItems} 
            isLoading={isLoading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />

          <AddConfigDialog 
            open={addDialogOpen} 
            onOpenChange={setAddDialogOpen} 
            onSuccess={fetchConfigItems} 
          />

          <EditConfigDialog 
            config={selectedConfig} 
            open={editDialogOpen} 
            onOpenChange={setEditDialogOpen} 
            onSuccess={fetchConfigItems} 
          />

          <DeleteConfigDialog 
            config={selectedConfig} 
            open={deleteDialogOpen} 
            onOpenChange={setDeleteDialogOpen} 
            onSuccess={fetchConfigItems}
          />
        </div>
      </div>
    </div>
  );
}
