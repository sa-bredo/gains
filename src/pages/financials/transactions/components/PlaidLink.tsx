
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  isOpen: boolean;
}

export function PlaidLink({ onSuccess, onExit, isOpen }: PlaidLinkProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    let script: HTMLScriptElement;
    const initPlaidLink = async () => {
      try {
        setIsLoading(true);
        
        // Use the isAuthenticated state from AuthContext instead of checking session
        if (!isAuthenticated) {
          console.error('No authentication detected');
          const errorMessage = "Please log in to connect your bank account.";
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: (
              <div className="flex items-center justify-between w-full">
                <span>{errorMessage}</span>
                <Copy 
                  className="h-4 w-4 cursor-pointer ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => {
                    navigator.clipboard.writeText("Authentication Error: " + errorMessage);
                    toast({ title: "Copied to clipboard" });
                  }}
                />
              </div>
            ),
          });
          onExit();
          return;
        }

        // Get the session explicitly for the API call
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('Session not found despite authentication');
          const errorMessage = "Session error. Please try logging out and back in.";
          toast({
            variant: "destructive",
            title: "Session Error",
            description: (
              <div className="flex items-center justify-between w-full">
                <span>{errorMessage}</span>
                <Copy 
                  className="h-4 w-4 cursor-pointer ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => {
                    navigator.clipboard.writeText("Session Error: " + errorMessage);
                    toast({ title: "Copied to clipboard" });
                  }}
                />
              </div>
            ),
          });
          onExit();
          return;
        }

        console.log('User is authenticated, fetching link token...');
        // Get a link token from our backend
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-link-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        });

        const data = await response.json();
        
        if (data.error) {
          console.error('Error creating link token:', data.error);
          const errorMessage = data.error || "Failed to initialize Plaid Link. Please try again.";
          toast({
            variant: "destructive",
            title: "Error",
            description: (
              <div className="flex items-center justify-between w-full">
                <span>{errorMessage}</span>
                <Copy 
                  className="h-4 w-4 cursor-pointer ml-2 text-muted-foreground hover:text-foreground" 
                  onClick={() => {
                    navigator.clipboard.writeText("Error: " + errorMessage);
                    toast({ title: "Copied to clipboard" });
                  }}
                />
              </div>
            ),
          });
          onExit();
          return;
        }

        const linkToken = data.link_token;
        console.log('Link token received:', linkToken);

        // For demo purposes without actually connecting to Plaid
        // Remove this in production and use the real Plaid integration below
        toast({
          title: "Demo Mode",
          description: "In a real app, this would connect to Plaid. For demo, we'll simulate a successful connection.",
        });
        
        // Simulate a successful connection after a short delay
        setTimeout(() => {
          const mockPublicToken = "public-sandbox-" + Math.random().toString(36).substring(2, 15);
          const mockMetadata = {
            institution: {
              name: "Demo Bank",
              institution_id: "ins_123456",
            },
            account: {
              id: "acc_" + Math.random().toString(36).substring(2, 10),
              name: "Demo Checking Account",
              mask: "1234",
              type: "depository",
              subtype: "checking",
            },
            accounts: [
              {
                id: "acc_" + Math.random().toString(36).substring(2, 10),
                name: "Demo Checking",
                mask: "1234",
                type: "depository",
                subtype: "checking",
              }
            ]
          };
          
          console.log('Simulating onSuccess with token:', mockPublicToken);
          onSuccess(mockPublicToken, mockMetadata);
          setIsLoading(false);
        }, 2000);

        // Uncomment this section to use the real Plaid Link in production
        /*
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
                console.log('Plaid Link success', metadata);
                onSuccess(public_token, metadata);
                setIsLoading(false);
              },
              onExit: (err: any, metadata: any) => {
                console.log('Plaid Link exited', err, metadata);
                setIsLoading(false);
                onExit();
              },
              onLoad: () => {
                // Open the Plaid Link interface automatically
                handler.open();
              },
            });
          } else {
            console.error('Plaid not loaded');
            const errorMessage = "Failed to load Plaid. Please try again.";
            toast({
              variant: "destructive",
              title: "Error",
              description: (
                <div className="flex items-center justify-between w-full">
                  <span>{errorMessage}</span>
                  <Copy 
                    className="h-4 w-4 cursor-pointer ml-2 text-muted-foreground hover:text-foreground" 
                    onClick={() => {
                      navigator.clipboard.writeText("Error: " + errorMessage);
                      toast({ title: "Copied to clipboard" });
                    }}
                  />
                </div>
              ),
            });
            setIsLoading(false);
            onExit();
          }
        };
        
        document.head.appendChild(script);
        */
      } catch (error) {
        console.error('Error initializing Plaid Link:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize Plaid Link. Please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: (
            <div className="flex items-center justify-between w-full">
              <span>{errorMessage}</span>
              <Copy 
                className="h-4 w-4 cursor-pointer ml-2 text-muted-foreground hover:text-foreground" 
                onClick={() => {
                  navigator.clipboard.writeText("Error: " + errorMessage);
                  toast({ title: "Copied to clipboard" });
                }}
              />
            </div>
          ),
        });
        setIsLoading(false);
        onExit();
      }
    };

    initPlaidLink();

    return () => {
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // The actual Plaid interface would be loaded via script, for demo we just display a modal
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExit()}>
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
          <Button variant="outline" onClick={onExit} disabled={isLoading}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
