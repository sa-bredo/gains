
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SlackConfig } from '../types';
import { disconnectSlack } from '../services/slack-service';
import { useCompany } from '@/contexts/CompanyContext';
import { AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface SlackSetupProps {
  slackConfig: SlackConfig | null;
  onConfigChange: () => Promise<void>;
}

export function SlackSetup({ slackConfig, onConfigChange }: SlackSetupProps) {
  const { currentCompany } = useCompany();
  const [disconnecting, setDisconnecting] = useState(false);
  const { toast } = useToast();
  
  const handleDisconnect = async () => {
    if (!currentCompany?.id) return;
    
    setDisconnecting(true);
    try {
      const success = await disconnectSlack(currentCompany.id);
      
      if (success) {
        await onConfigChange();
        toast({
          title: 'Slack disconnected',
          description: 'Your workspace has been successfully disconnected.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error disconnecting',
          description: 'There was an error disconnecting from Slack.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast({
        title: 'Error disconnecting',
        description: 'There was an error disconnecting from Slack.',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(false);
    }
  };
  
  const initiateOAuth = () => {
    if (!currentCompany?.id) return;
    
    // Generate a random state to prevent CSRF attacks 
    // and also store the company_id so we can identify it in the callback
    const state = btoa(JSON.stringify({
      company_id: currentCompany.id,
      timestamp: new Date().getTime()
    }));
    
    // Store the state in localStorage for verification after redirect
    localStorage.setItem('slack_oauth_state', state);
    
    // Redirect to Supabase Edge Function that will initiate the OAuth flow
    window.location.href = `/api/initiate-slack-oauth?state=${state}`;
  };
  
  if (!currentCompany) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>Connect your Slack workspace to enable messaging features.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>No company selected</AlertTitle>
            <AlertDescription>
              Please select a company to configure Slack integration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slack Integration</CardTitle>
        <CardDescription>Connect your Slack workspace to enable messaging features.</CardDescription>
      </CardHeader>
      <CardContent>
        {slackConfig?.slack_workspace_id ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium">Connected to Slack</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="font-medium">Workspace</div>
                <div>{slackConfig.slack_workspace_name}</div>
                <div className="font-medium">Team URL</div>
                <div>
                  <a 
                    href={slackConfig.slack_team_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {slackConfig.slack_team_url}
                  </a>
                </div>
                <div className="font-medium">Connected at</div>
                <div>{new Date(slackConfig.connected_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Connect your Slack workspace to enable messaging employees directly from this platform.
              This integration requires a Slack app with the following scopes:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
              <li>chat:write</li>
              <li>users:read</li>
              <li>users:read.email</li>
              <li>im:write</li>
            </ul>
            <div className="bg-slate-50 p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Instructions:</p>
              <ol className="list-decimal pl-5 text-sm text-gray-500 space-y-1">
                <li>Click the "Connect to Slack" button below</li>
                <li>Authorize the application in the Slack popup</li>
                <li>You'll be redirected back to this page once authentication is complete</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {slackConfig?.slack_workspace_id ? (
          <Button 
            variant="destructive"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disconnect from Slack
          </Button>
        ) : (
          <Button
            onClick={initiateOAuth}
            className="bg-[#4A154B] hover:bg-[#611f64] text-white"
          >
            <img
              src="https://cdn.brandfolder.io/5H442O3W/at/pl546j-7le8zk-btwjnu/Slack_Mark_Web.svg"
              alt="Slack"
              className="w-4 h-4 mr-2"
            />
            Connect to Slack
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
