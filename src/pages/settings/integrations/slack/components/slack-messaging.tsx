
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { getMessageTemplates, getSlackEmployees, sendSlackMessage } from '../services/slack-service';
import { MessageTemplate, SlackConfig } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { SendHorizontal, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type RecipientType = 'employee' | 'channel' | 'group';

interface SlackMessagingProps {
  slackConfig: SlackConfig | null;
}

interface SlackEmployeeWithInfo {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  slack_user_id: string | null;
  slack_username: string | null;
  slack_connected: boolean;
  slack_connected_at: string | null;
}

export function SlackMessaging({ slackConfig }: SlackMessagingProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<RecipientType>('employee');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [employees, setEmployees] = useState<SlackEmployeeWithInfo[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [channels] = useState<{ id: string; name: string }[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  useEffect(() => {
    loadEmployees();
    loadTemplates();
  }, []);
  
  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const empData = await getSlackEmployees();
      setEmployees(empData || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoadingEmployees(false);
    }
  };
  
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const templatesData = await getMessageTemplates();
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load message templates');
    } finally {
      setLoadingTemplates(false);
    }
  };
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleRecipientTypeChange = (value: string) => {
    setRecipientType(value as RecipientType);
    // Reset selections when changing recipient type
    setSelectedEmployees([]);
    setSelectedChannels([]);
  };
  
  const handleEmployeeCheckChange = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };
  
  const handleChannelCheckChange = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };
  
  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setMessage(template.content);
    }
    setSelectedTemplate('');
    setShowTemplateDialog(false);
  };
  
  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    if (recipientType === 'employee' && selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    
    if (recipientType === 'channel' && selectedChannels.length === 0) {
      toast.error('Please select at least one channel');
      return;
    }
    
    if (!slackConfig?.slack_workspace_id || !user?.id) {
      toast.error('Slack configuration is missing');
      return;
    }
    
    setSendingMessage(true);
    try {
      // Get the recipients based on type
      const recipients = recipientType === 'employee' ? selectedEmployees : selectedChannels;
      
      const result = await sendSlackMessage(
        recipients,
        recipientType,
        message,
        slackConfig.slack_workspace_id,
        user.id
      );
      
      if (result.success) {
        toast.success('Message sent successfully');
        setMessage('');
        setSelectedEmployees([]);
        setSelectedChannels([]);
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };
  
  const getConnectedEmployees = () => {
    return employees.filter((employee) => employee.slack_connected);
  };
  
  const allEmployeesSelected = 
    selectedEmployees.length === getConnectedEmployees().length && 
    getConnectedEmployees().length > 0;
  
  const handleSelectAllEmployees = () => {
    if (allEmployeesSelected) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(
        getConnectedEmployees().map((employee) => employee.employee_id)
      );
    }
  };
  
  const allChannelsSelected = 
    selectedChannels.length === channels.length && channels.length > 0;
  
  const handleSelectAllChannels = () => {
    if (allChannelsSelected) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(channels.map((channel) => channel.id));
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Slack Messaging</CardTitle>
        <CardDescription>
          Send messages to employees or channels in Slack
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose Message</TabsTrigger>
            <TabsTrigger value="history">Message History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="mt-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="recipient-type">Send To</Label>
                  <Select 
                    value={recipientType} 
                    onValueChange={handleRecipientTypeChange}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employees</SelectItem>
                      <SelectItem value="channel">Channels</SelectItem>
                      <SelectItem value="group">Groups</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-3">
                  <div className="flex justify-between">
                    <Label>
                      {recipientType === 'employee' && 'Select Employees'}
                      {recipientType === 'channel' && 'Select Channels'}
                      {recipientType === 'group' && 'Select Groups'}
                    </Label>
                    
                    {recipientType === 'employee' && (
                      <Button 
                        variant="link" 
                        className="h-6 p-0" 
                        onClick={handleSelectAllEmployees}
                      >
                        {allEmployeesSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                    
                    {recipientType === 'channel' && (
                      <Button 
                        variant="link" 
                        className="h-6 p-0" 
                        onClick={handleSelectAllChannels}
                      >
                        {allChannelsSelected ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-4 mt-2 max-h-60 overflow-y-auto">
                    {loadingEmployees && recipientType === 'employee' && (
                      <div className="text-center py-4">Loading employees...</div>
                    )}
                    
                    {recipientType === 'employee' && !loadingEmployees && (
                      <div className="space-y-2">
                        {getConnectedEmployees().length === 0 ? (
                          <div className="text-center py-4">
                            No employees connected to Slack
                          </div>
                        ) : (
                          getConnectedEmployees().map((employee) => (
                            <div 
                              key={employee.id} 
                              className="flex items-center space-x-2"
                            >
                              <Checkbox 
                                id={`employee-${employee.id}`}
                                checked={selectedEmployees.includes(employee.employee_id)}
                                onCheckedChange={() => 
                                  handleEmployeeCheckChange(employee.employee_id)
                                }
                              />
                              <label 
                                htmlFor={`employee-${employee.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                              >
                                {employee.first_name} {employee.last_name}
                                <Badge className="ml-2 bg-blue-500" variant="secondary">
                                  {employee.slack_username || employee.email}
                                </Badge>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {recipientType === 'channel' && (
                      <div className="space-y-2">
                        {channels.length === 0 ? (
                          <div className="text-center py-4">
                            No channels available
                          </div>
                        ) : (
                          channels.map((channel) => (
                            <div 
                              key={channel.id} 
                              className="flex items-center space-x-2"
                            >
                              <Checkbox 
                                id={`channel-${channel.id}`}
                                checked={selectedChannels.includes(channel.id)}
                                onCheckedChange={() => 
                                  handleChannelCheckChange(channel.id)
                                }
                              />
                              <label 
                                htmlFor={`channel-${channel.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                #{channel.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {recipientType === 'group' && (
                      <div className="text-center py-4">
                        Group messaging coming soon
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="message">Message</Label>
                  
                  <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select Template</DialogTitle>
                        <DialogDescription>
                          Choose a template to use for your message
                        </DialogDescription>
                      </DialogHeader>
                      
                      {loadingTemplates ? (
                        <div className="py-4 text-center">Loading templates...</div>
                      ) : templates.length === 0 ? (
                        <div className="py-4 text-center">No templates available</div>
                      ) : (
                        <div className="py-4">
                          <Select 
                            value={selectedTemplate} 
                            onValueChange={setSelectedTemplate}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {selectedTemplate && (
                            <div className="mt-4 p-3 border rounded-md bg-muted">
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {templates.find(t => t.id === selectedTemplate)?.content}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button 
                          onClick={() => handleSelectTemplate(selectedTemplate)}
                          disabled={!selectedTemplate}
                        >
                          Use Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  className="min-h-[120px]"
                  value={message}
                  onChange={handleMessageChange}
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSendMessage} 
                  disabled={sendingMessage}
                  className="flex items-center"
                >
                  {sendingMessage ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    Message history will be displayed here
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
