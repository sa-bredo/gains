
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Page, PageAutomation } from '@/pages/page-flows/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

interface PageAutomationEditorProps {
  page: Page;
  onSave: (pageData: Partial<Page>) => void;
}

const automationSchema = z.object({
  type: z.enum(['email', 'slack', 'webhook']),
  config: z.object({
    recipientType: z.enum(['assigned_user', 'custom']).optional(),
    recipient: z.string().optional(),
    subject: z.string().optional(),
    template: z.string().optional(),
    message: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    headers: z.string().optional(),
    body: z.string().optional(),
  }).partial(),
});

type FormValues = {
  type: 'email' | 'slack' | 'webhook';
  config: {
    recipientType?: 'assigned_user' | 'custom';
    recipient?: string;
    subject?: string;
    template?: string;
    message?: string;
    webhookUrl?: string;
    headers?: string;
    body?: string;
  };
};

export function PageAutomationEditor({ page, onSave }: PageAutomationEditorProps) {
  const defaultAutomation = page.automation_config || {
    type: 'email',
    config: {},
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      type: defaultAutomation.type || 'email',
      config: defaultAutomation.config || {},
    },
  });

  const automationType = form.watch('type');

  const handleSave = (data: FormValues) => {
    const updatedPage: Partial<Page> = {
      automation_config: data as PageAutomation,
    };
    onSave(updatedPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configure Automation</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Automation Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select automation type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="email">Send Email</SelectItem>
                    <SelectItem value="slack">Send Slack Message</SelectItem>
                    <SelectItem value="webhook">Call Webhook</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the type of automation to execute between pages
                </FormDescription>
              </FormItem>
            )}
          />

          {automationType === 'email' && (
            <>
              <FormField
                control={form.control}
                name="config.recipientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assigned_user">Assigned User</SelectItem>
                        <SelectItem value="custom">Custom Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('config.recipientType') === 'custom' && (
                <FormField
                  control={form.control}
                  name="config.recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="email@example.com" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="config.subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Subject line" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Email content"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use variables like &#123;&#123;assignee.name&#125;&#125; to personalize the message
                    </FormDescription>
                  </FormItem>
                )}
              />
            </>
          )}

          {automationType === 'slack' && (
            <>
              <FormField
                control={form.control}
                name="config.recipientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="assigned_user">Assigned User</SelectItem>
                        <SelectItem value="custom">Custom Channel</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {form.watch('config.recipientType') === 'custom' && (
                <FormField
                  control={form.control}
                  name="config.recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Name</FormLabel>
                      <FormControl>
                        <Input placeholder="#general" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="config.message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Message content"
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use variables like &#123;&#123;assignee.name&#125;&#125; to personalize the message
                    </FormDescription>
                  </FormItem>
                )}
              />
            </>
          )}

          {automationType === 'webhook' && (
            <>
              <FormField
                control={form.control}
                name="config.webhookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/webhook" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.headers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headers (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="config.body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Body (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value", "data": "example"}'
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use variables like &#123;&#123;assignee.name&#125;&#125; in your JSON
                    </FormDescription>
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit">Save Automation</Button>
        </form>
      </Form>
    </div>
  );
}
