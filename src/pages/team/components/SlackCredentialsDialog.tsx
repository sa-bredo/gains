
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

const formSchema = z.object({
  client_id: z.string().min(1, 'Client ID is required'),
  client_secret: z.string().min(1, 'Client Secret is required'),
  redirect_uri: z.string().min(1, 'Redirect URI is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface SlackCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SlackCredentialsDialog({
  open,
  onOpenChange,
  onSuccess,
}: SlackCredentialsDialogProps) {
  const { currentCompany } = useCompany();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: '',
      client_secret: '',
      redirect_uri: 'https://exatcpxfenndpkozdnje.functions.supabase.co/slack-oauth-callback',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!currentCompany?.id) {
      toast.error('No workspace selected');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Submitting Slack credentials:', {
        company_id: currentCompany.id,
        client_id: values.client_id,
        client_secret: values.client_secret,
        redirect_uri: values.redirect_uri
      });
      
      const { data, error } = await supabase.functions.invoke("add-slack-credentials", {
        body: {
          company_id: currentCompany.id,
          client_id: values.client_id,
          client_secret: values.client_secret,
          redirect_uri: values.redirect_uri
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      if (!data || !data.success) {
        console.error('Error response from edge function:', data);
        throw new Error(data?.error || "Failed to store credentials");
      }

      toast.success('Slack credentials stored successfully');
      form.reset();
      onSuccess();
      onOpenChange(false);

    } catch (error) {
      console.error('Error storing Slack credentials:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to store Slack credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Slack Integration</DialogTitle>
          <DialogDescription>
            Add your Slack application credentials to connect your workspace to Slack.
            You can find these in your <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Slack API dashboard</a>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123456789.123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Secret</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your Slack client secret" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="redirect_uri"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Redirect URI</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="text-xs">
                    Make sure this matches the redirect URL configured in your Slack app
                  </FormMessage>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Credentials'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
