
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSlackEmployees, getMessageTemplates, sendSlackMessage } from '../services/slack-service';
import { SlackConfig, MessageTemplate } from '../types';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@clerk/clerk-react';

interface SlackMessagingProps {
  slackConfig: SlackConfig | null;
}

interface SlackEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  slack_connected: boolean;
  slack_user_id: string | null;
}

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  member_count: number;
}

export function SlackMessaging({ slackConfig }: SlackMessagingProps) {
  const { currentCompany } = useCompany();
  const { userId } = useAuth();
  const [messageType, setMessageType] = useState<'employee' | 'channel'>('employee');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<SlackEmployee[]>([]);
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [message, setMessage] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setMessage(template.content);
      }
    }
  }, [selectedTemplate, templates]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Load employees
      const empData = await getSlackEmployees();
      setEmployees(empData.filter(e => e.slack_connected));
      
      // Load message templates
      const templateData = await getMessageTemplates();
      setTemplates(templateData);
      
      // For now, we'll add some dummy channels
      // In a real implementation, you'd fetch these from the Slack API
      setChannels([
        { id: 'general', name: 'general', is_private: false, member_count: 25 },
        { id: 'random', name: 'random', is_private: false, member_count: 20 },
        { id: 'announcements', name: 'announcements', is_private: false, member_count: 30 },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not fetch employees or channels.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message to send.',
        variant: 'destructive',
      });
      return;
    }
    
    if (messageType === 'employee' && selectedEmployees.length === 0) {
      toast({
        title: 'Recipients Required',
        description: 'Please select at least one employee to message.',
        variant: 'destructive',
      });
      return;
    }
    
    if (messageType === 'channel' && !selectedChannel) {
      toast({
        title: 'Channel Required',
        description: 'Please select a channel to message.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentCompany?.id || !userId) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to send messages.',
        variant: 'destructive',
      });
      return;
    }
    
    setSending(true);
    try {
      const recipients = messageType === 'employee' ? selectedEmployees : [selectedChannel];
      
      const result = await sendSlackMessage(
        recipients,
        messageType,
        message,
        currentCompany.id,
        userId
      );
      
      if (result.success) {
        toast({
          title: 'Message Sent',
          description: `Successfully sent message to ${messageType === 'employee' ? 'employees' : 'channel'}.`,
          variant: 'default',
        });
        
        // Reset form
        setMessage('');
        setSelectedEmployees([]);
        setSelectedChannel('');
        setSelectedTemplate('');
      } else {
        toast({
          title: 'Error Sending Message',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error Sending Message',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };
  
  const toggleEmployeeSelection = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };
  
  const selectAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Slack Messages</CardTitle>
        <CardDescription>
          Send direct messages to employees or post to channels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Message Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or write your own message" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template (custom message)</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className="min-h-[120px]"
              />
            </div>
            
            <Tabs value={messageType} onValueChange={(v) => setMessageType(v as 'employee' | 'channel')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Message Employees</TabsTrigger>
                <TabsTrigger value="channel">Message Channel</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee" className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <Label>Select Employees</Label>
                  {employees.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllEmployees}
                    >
                      {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
                
                {employees.length === 0 ? (
                  <div className="text-center p-4 border rounded-md bg-slate-50">
                    <p className="text-sm text-gray-500">No employees are connected to Slack.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.href = '/settings/integrations/slack?tab=employees'}
                    >
                      Connect Employees
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[250px] border rounded-md p-2">
                    <div className="space-y-2">
                      {employees.map(employee => (
                        <div key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-md">
                          <Checkbox
                            id={`employee-${employee.id}`}
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}`} />
                              <AvatarFallback>{employee.first_name[0]}{employee.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <Label 
                              htmlFor={`employee-${employee.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              {employee.first_name} {employee.last_name}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="channel" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="channel">Select Channel</Label>
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger id="channel">
                      <SelectValue placeholder="Select a channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>
                          #{channel.name} ({channel.member_count} members)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              className="w-full" 
              onClick={handleSendMessage}
              disabled={sending || 
                !message.trim() || 
                (messageType === 'employee' && selectedEmployees.length === 0) ||
                (messageType === 'channel' && !selectedChannel)}
            >
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
