
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/contexts/CompanyContext";
import { GeneralSettingField, GeneralSettingsConfig } from "./types";
import { GeneralSettingsForm } from "./components/general-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsConfig, setSettingsConfig] = useState<GeneralSettingField[]>([]);
  const { currentCompany } = useCompany();

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      if (!currentCompany) {
        console.log('No company selected');
        setSettingsConfig([]);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching general settings for company:', currentCompany.id);
      
      // Fetch the general settings configuration
      const { data, error } = await supabase
        .from('config')
        .select('id, key, value, company_id')
        .eq('company_id', currentCompany.id)
        .eq('key', 'general_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        try {
          // Parse the JSON configuration
          const settings: GeneralSettingField[] = JSON.parse(data.value);
          setSettingsConfig(settings);
          console.log('Fetched general settings:', settings);
        } catch (parseError) {
          console.error('Error parsing general settings JSON:', parseError);
          toast.error('Failed to parse general settings configuration');
          setSettingsConfig([]);
        }
      } else {
        // If no config exists, set default settings
        const defaultSettings: GeneralSettingField[] = [
          {
            name: 'currency',
            display_name: 'Currency',
            type: 'select',
            value: 'GBP',
            options: [
              { value: 'GBP', label: 'British Pound (£)' },
              { value: 'USD', label: 'US Dollar ($)' },
              { value: 'EUR', label: 'Euro (€)' }
            ],
            description: 'Default currency used throughout the application'
          },
          {
            name: 'timezone',
            display_name: 'Timezone',
            type: 'select',
            value: 'Europe/London',
            options: [
              { value: 'Europe/London', label: 'London (GMT/BST)' },
              { value: 'America/New_York', label: 'New York (EST/EDT)' },
              { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
              { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
              { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' }
            ],
            description: 'Default timezone for date and time displays'
          }
        ];
        setSettingsConfig(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching general settings:', error);
      toast.error('Failed to load general settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: GeneralSettingField[]) => {
    try {
      if (!currentCompany) {
        toast.error('No workspace selected');
        return;
      }
      
      console.log('Saving general settings:', updatedSettings);
      
      // Check if config exists
      const { data: existingConfig, error: fetchError } = await supabase
        .from('config')
        .select('id')
        .eq('company_id', currentCompany.id)
        .eq('key', 'general_settings')
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingConfig) {
        // Update existing config
        const { error: updateError } = await supabase
          .from('config')
          .update({ 
            value: JSON.stringify(updatedSettings)
          })
          .eq('id', existingConfig.id);
          
        if (updateError) throw updateError;
      } else {
        // Create new config
        const { error: insertError } = await supabase
          .from('config')
          .insert({
            key: 'general_settings',
            display_name: 'General Settings',
            value: JSON.stringify(updatedSettings),
            company_id: currentCompany.id
          });
          
        if (insertError) throw insertError;
      }
      
      toast.success('General settings saved successfully');
      setSettingsConfig(updatedSettings);
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save general settings');
    }
  };

  const handleUpdateSetting = (name: string, value: string) => {
    const updatedSettings = settingsConfig.map(setting => 
      setting.name === name ? { ...setting, value } : setting
    );
    
    saveSettings(updatedSettings);
  };

  useEffect(() => {
    if (currentCompany) {
      fetchSettings();
    }
  }, [currentCompany]);

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="mr-2" />
            <Separator orientation="vertical" className="h-4" />
            <span className="font-medium">Settings / General</span>
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">General Settings</h1>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure global settings for your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GeneralSettingsForm 
                  settings={settingsConfig} 
                  onUpdateSetting={handleUpdateSetting} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </div>
  );
}
