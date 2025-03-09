import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SlackConfig } from "../types";
import { useToast } from "@/hooks/use-toast";

const slackCredentialsSchema = z.object({
  client_id: z.string().min(1, "Client ID is required"),
  client_secret: z.string().min(1, "Client Secret is required"),
  redirect_uri: z.string().min(1, "Redirect URI is required").url("Invalid URL"),
});

interface SlackCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slackConfig: SlackConfig | null | undefined;
  onSuccess: () => void;
}

type SlackCredentialsFormValues = z.infer<typeof slackCredentialsSchema>;

export function SlackCredentialsDialog({
  open,
  onOpenChange,
  slackConfig,
  onSuccess,
}: SlackCredentialsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<SlackCredentialsFormValues>({
    resolver: zodResolver(slackCredentialsSchema),
    defaultValues: {
      client_id: slackConfig?.client_id || "",
      client_secret: slackConfig?.client_secret || "",
      redirect_uri: slackConfig?.redirect_uri || "",
    },
  });

  async function onSubmit(values: SlackCredentialsFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/supabase/add-slack-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Slack credentials saved",
          description: "Slack credentials have been saved successfully.",
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to save Slack credentials.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          (error instanceof Error && error.message) ||
          "Failed to save Slack credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Slack Credentials</DialogTitle>
          <DialogDescription>
            Enter your Slack app credentials to connect to Slack.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="client_id">Client ID</Label>
            <Input id="client_id" type="text" placeholder="Client ID" {...form.register("client_id")} />
            {form.formState.errors.client_id && (
              <p className="text-sm text-red-500">{form.formState.errors.client_id.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client_secret">Client Secret</Label>
            <Input
              id="client_secret"
              type="password"
              placeholder="Client Secret"
              {...form.register("client_secret")}
            />
            {form.formState.errors.client_secret && (
              <p className="text-sm text-red-500">{form.formState.errors.client_secret.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="redirect_uri">Redirect URI</Label>
            <Input
              id="redirect_uri"
              type="text"
              placeholder="Redirect URI"
              {...form.register("redirect_uri")}
            />
            {form.formState.errors.redirect_uri && (
              <p className="text-sm text-red-500">{form.formState.errors.redirect_uri.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save credentials"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
