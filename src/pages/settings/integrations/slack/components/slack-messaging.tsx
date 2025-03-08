
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SlackConfig, SlackChannelInfo, MessageStatus } from '../types';
import { MessageSquare, Users, Send, Variable, AlertTriangle, Loader2, MessagesSquare } from "lucide-react";

interface SlackMessagingProps {
  slackConfig: SlackConfig | null;
}

const messageSchema = z.object({
  recipient_type: z.enum(['employee', 'channel']),
  recipient_id: z.string().min(1, "Recipient is required"),
  message: z.string().min(1, "Message is required"),
  template_id: z.string().optional(),
});

type MessageValues = z.infer<typeof messageSchema>;

export function SlackMessaging({ slackConfig }: SlackMessagingProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<{ id: string; name: string; slack_user_id?: string; slack_connected?: boolean }[]>([]);
  const [channels, setChannels] = useState<SlackChannelInfo[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [sending, setSending] = useState(false);
  const [templates, setTemplates] = useState<{id: string; name: string; content: string}[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  const form = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      recipient_type: 'employee',
      recipient_id: '',
      message: '',
      template_id: '',
    },
  });

  const watchRecipientType = form.watch('recipient_type');
  const watchTemplateId = form.watch('template_id');

  useEffect(() => {
    if (slackConfig) {
      fetchData();
    }
  }, [slackConfig]);

  useEffect(() => {
    // When template is selected, update the message content
    if (watchTemplateId) {
      const selectedTemplate = templates.find(t => t.id === watchTemplateId);
      if (selectedTemplate) {
        form.setValue('message', selectedTemplate.content);
      }
    }
  }, [watchTemplateId, templates]);

  const fetchData = async () => {
    await Promise.all([
      fetchEmployees(),
      fetchChannels(),
      fetchTemplates()
    ]);
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, first_name, last_name');
      
      if (employeesError) throw employeesError;
      
      const { data: slackEmployeeData, error: slackError } = await supabase
        .from('slack_employees')
        .select('employee_id, slack_user_id, slack_connected');
      
      if (slackError) throw slackError;
      
      // Map and combine data
      const employeesWithSlack = employeesData.map(emp => {
        const slackData = slackEmployeeData.find(se => se.employee_id === emp.id);
        return {
          id: emp.id,
          name: `${emp.first_name} ${emp.last_name}`,
          slack_user_id: slackData?.slack_user_id,
          slack_connected: slackData?.slack_connected || false
        };
      });
      
      setEmployees(employeesWithSlack);
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast({
        variant: "destructive",
        title: "Failed to load employees",
        description: "There was an error loading employee data",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      
      // This would be a call to a Supabase edge function in production
      const { data, error } = await supabase.functions.invoke('get-slack-channels', {
        body: { workspace_id: slackConfig?.slack_workspace_id },
      });
      
      if (error) throw error;
      
      setChannels(data || []);
    } catch (err) {
      console.error('Error fetching channels:', err);
      toast({
        variant: "destructive",
        title: "Failed to load channels",
        description: "There was an error loading Slack channels",
      });
    } finally {
      setLoadingChannels(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      
      const { data, error } = await supabase
        .from('slack_message_templates')
        .select('id, name, content');
      
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const onSubmit = async (values: MessageValues) => {
    try {
      setSending(true);
      
      const recipients = watchRecipientType === 'employee' 
        ? selectedRecipients.length > 0 
          ? selectedRecipients 
          : [values.recipient_id]
        : [values.recipient_id];
      
      if (recipients.length === 0) {
        toast({
          variant: "destructive",
          title: "No recipients selected",
          description: "Please select at least one recipient",
        });
        return;
      }
      
      // Send messages to all recipients
      const result = await supabase.functions.invoke('send-slack-message', {
        body: {
          recipient_type: values.recipient_type,
          recipients: recipients,
          message: values.message,
          workspace_id: slackConfig?.slack_workspace_id
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Message Sent",
        description: recipients.length > 1
          ? `Your message was sent to ${recipients.length} recipients`
          : "Your message was sent successfully",
      });
      
      // Reset form
      form.reset();
      setSelectedRecipients([]);
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: err instanceof Error ? err.message : "There was an error sending your message",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectAll = () => {
    const connectedEmployees = employees
      .filter(emp => emp.slack_connected)
      .map(emp => emp.id);
    
    setSelectedRecipients(connectedEmployees);
  };

  const toggleRecipient = (employeeId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const insertVariable = (variable: string) => {
    const message = form.getValues('message');
    form.setValue('message', `${message} {${variable}}`, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Slack Messages</CardTitle>
        <CardDescription>
          Send messages to employees or channels in your Slack workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="direct" className="space-y-4">
          <TabsList>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Direct Message
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Message
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="direct">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="recipient_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Send To</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="channel">Channel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipient_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchRecipientType === 'employee' ? 'Employee' : 'Channel'}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={watchRecipientType === 'employee' ? loadingEmployees : loadingChannels}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${watchRecipientType === 'employee' ? 'employee' : 'channel'}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {watchRecipientType === 'employee' ? (
                              employees.map(employee => (
                                <SelectItem 
                                  key={employee.id} 
                                  value={employee.id}
                                  disabled={!employee.slack_connected}
                                >
                                  {employee.name} {!employee.slack_connected && "(Not connected)"}
                                </SelectItem>
                              ))
                            ) : (
                              channels.map(channel => (
                                <SelectItem key={channel.id} value={channel.id}>
                                  #{channel.name} ({channel.member_count} members)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="bulk">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Select Employees</FormLabel>
                    <div className="flex items-center gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        Select All Connected
                      </Button>
                      <Badge variant="outline">
                        {selectedRecipients.length} selected
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-2 h-[250px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {employees.map(employee => (
                        <div 
                          key={employee.id} 
                          className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                        >
                          <Checkbox 
                            id={`employee-${employee.id}`}
                            checked={selectedRecipients.includes(employee.id)}
                            onCheckedChange={() => toggleRecipient(employee.id)}
                            disabled={!employee.slack_connected}
                          />
                          <label 
                            htmlFor={`employee-${employee.id}`}
                            className={`flex-grow text-sm cursor-pointer ${!employee.slack_connected ? 'text-muted-foreground' : ''}`}
                          >
                            {employee.name}
                            {!employee.slack_connected && (
                              <span className="ml-2 text-xs text-muted-foreground">(Not connected)</span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingTemplates}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template or write your own message" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No template</SelectItem>
                        {templates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a template or create a custom message below
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Message</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="h-7 gap-1"
                          >
                            <Variable className="h-3.5 w-3.5" />
                            <span className="text-xs">Insert Variable</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Template Variables</h4>
                            <div className="grid gap-1">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="justify-start text-xs h-7"
                                onClick={() => insertVariable('employee_name')}
                              >
                                {'{employee_name}'}
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="justify-start text-xs h-7"
                                onClick={() => insertVariable('employee_email')}
                              >
                                {'{employee_email}'}
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="justify-start text-xs h-7"
                                onClick={() => insertVariable('employee_role')}
                              >
                                {'{employee_role}'}
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message here..." 
                        className="min-h-[150px]" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(watchRecipientType === 'bulk' || form.getValues('recipient_type') === 'bulk') && 
               selectedRecipients.length === 0 && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Please select at least one recipient</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={sending || (watchRecipientType === 'bulk' && selectedRecipients.length === 0)}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessagesSquare className="h-4 w-4" />
          <span>Messages will be sent from your connected Slack app</span>
        </div>
      </CardFooter>
    </Card>
  );
}
