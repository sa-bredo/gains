
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PlaidLinkProps = {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
};

export function PlaidLink({ onSuccess, onExit }: PlaidLinkProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadPlaidLink = async () => {
      try {
        // Create link token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-link-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
        toast({
          title: "Error",
          description: "Failed to initiate bank connection. Please try again.",
          variant: "destructive",
        });
        setIsOpen(false);
        onExit();
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaidLink();

    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!linkToken || isLoading) return;

    let linkHandler: any = null;

    // Initialize Plaid Link
    const initializePlaidLink = () => {
      if (!window.Plaid) {
        // If Plaid is not loaded yet, wait and try again
        setTimeout(initializePlaidLink, 100);
        return;
      }

      linkHandler = window.Plaid.create({
        token: linkToken,
        onSuccess: (public_token: string, metadata: any) => {
          setIsOpen(false);
          onSuccess(public_token, metadata);
        },
        onExit: (err: any, metadata: any) => {
          setIsOpen(false);
          onExit();
        },
        onLoad: () => {
          // Open the Plaid Link immediately when loaded
          linkHandler.open();
        },
      });
    };

    initializePlaidLink();

    return () => {
      // Clean up Plaid Link instance when component unmounts
      if (linkHandler) {
        linkHandler.destroy();
      }
    };
  }, [linkToken, isLoading]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onExit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Bank Account</DialogTitle>
          <DialogDescription>
            Securely connect your bank account to sync transactions.
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Initializing secure connection...
            </p>
          </div>
        )}
        <div id="plaid-link-container"></div>
      </DialogContent>
    </Dialog>
  );
}

// Add TypeScript definition for the Plaid Link
declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void;
        destroy: () => void;
      };
    };
  }
}
