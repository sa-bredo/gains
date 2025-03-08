
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlackSetup } from './components/slack-setup';
import { SlackEmployeeManager } from './components/slack-employee-manager';
import { SlackMessaging } from './components/slack-messaging';
import { SlackTemplates } from './components/slack-templates';
import { SlackConfig } from './types';
import { Card } from '@/components/ui/card';
import { getSlackConfig } from './services/slack-service';
import { useCompany } from '@/contexts/CompanyContext';
import { Loader2 } from 'lucide-react';

export default function SlackIntegrationPage() {
  const { company } = useCompany();
  const [slackConfig, setSlackConfig] = useState<SlackConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    if (company?.id) {
      loadSlackConfig();
    }
  }, [company?.id]);

  const loadSlackConfig = async () => {
    setLoading(true);
    try {
      if (!company?.id) return;
      
      const config = await getSlackConfig(company.id);
      setSlackConfig(config);
      
      // If already connected, set active tab to messaging
      if (config?.slack_workspace_id) {
        setActiveTab('messaging');
      }
    } catch (error) {
      console.error('Error loading Slack config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full p-6 flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Slack Integration</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger 
            value="employees" 
            disabled={!slackConfig?.slack_workspace_id}
          >
            Employees
          </TabsTrigger>
          <TabsTrigger 
            value="messaging" 
            disabled={!slackConfig?.slack_workspace_id}
          >
            Messaging
          </TabsTrigger>
          <TabsTrigger 
            value="templates" 
            disabled={!slackConfig?.slack_workspace_id}
          >
            Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="setup" className="mt-6">
          <SlackSetup 
            slackConfig={slackConfig} 
            onConfigChange={loadSlackConfig} 
          />
        </TabsContent>
        
        <TabsContent value="employees" className="mt-6">
          <SlackEmployeeManager />
        </TabsContent>
        
        <TabsContent value="messaging" className="mt-6">
          <SlackMessaging slackConfig={slackConfig} />
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          <SlackTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}
