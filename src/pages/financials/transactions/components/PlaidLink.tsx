
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
}

export function PlaidLink({ onSuccess, onExit }: PlaidLinkProps) {
  const { toast } = useToast();

  useEffect(() => {
    let script: HTMLScriptElement;
    const initPlaidLink = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          onExit();
          return;
        }

        // Get a link token from our backend
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-link-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        });

        const { linkToken, error } = await response.json();
        
        if (error) {
          console.error('Error creating link token:', error);
          toast({
            title: "Error",
            description: "Failed to initialize Plaid Link. Please try again.",
            variant: "destructive",
          });
          onExit();
          return;
        }

        // Load the Plaid Link script
        script = document.createElement('script');
        script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
        script.async = true;
        script.onload = () => {
          // Initialize Plaid Link
          if ((window as any).Plaid) {
            const handler = (window as any).Plaid.create({
              token: linkToken,
              onSuccess: (public_token: string, metadata: any) => {
                onSuccess(public_token, metadata);
              },
              onExit: (err: any, metadata: any) => {
                console.log('Plaid Link exited', err, metadata);
                onExit();
              },
              onLoad: () => {
                // Open the Plaid Link interface automatically
                handler.open();
              },
            });
          } else {
            console.error('Plaid not loaded');
            toast({
              title: "Error",
              description: "Failed to load Plaid. Please try again.",
              variant: "destructive",
            });
            onExit();
          }
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing Plaid Link:', error);
        toast({
          title: "Error",
          description: "Failed to initialize Plaid Link. Please try again.",
          variant: "destructive",
        });
        onExit();
      }
    };

    initPlaidLink();

    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // The actual Plaid interface is loaded via script, so we just display a modal
  return (
    <Dialog open={true} onOpenChange={() => onExit()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your Bank</DialogTitle>
          <DialogDescription>
            Loading the secure connection to your bank. This may take a moment...
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onExit}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
