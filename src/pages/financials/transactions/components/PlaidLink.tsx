
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  isOpen: boolean;
}

export function PlaidLink({ onSuccess, onExit, isOpen }: PlaidLinkProps) {
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSessionError = async () => {
    // Force a logout and redirect to login
    try {
      await logout();
      toast({
        title: "Session expired",
        description: "Your session has expired. Please log in again.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    let script: HTMLScriptElement;
    const initPlaidLink = async () => {
      try {
        setIsLoading(true);
        setErrorDetails(null);
        
        // Use the isAuthenticated state from AuthContext
        if (!isAuthenticated) {
          console.error('No authentication detected');
          const errorMessage = "Please log in to connect your bank account.";
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: errorMessage
          });
          onExit();
          return;
        }

        console.log('User is authenticated, proceeding with Plaid connection');
        
        // Get the session explicitly for the API call
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session not found despite authentication:', sessionError);
          const errorMessage = "Session error. Please try logging out and back in.";
          toast({
            variant: "destructive",
            title: "Session Error",
            description: errorMessage
          });
          handleSessionError();
          return;
        }

        // Hardcoded full URL to the Supabase function
        const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/create-link-token";
        console.log('Requesting link token from:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST', // Changed from GET to POST for consistency
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error('API response error:', response.status);
            let errorText = await response.text();
            console.error('Error details:', errorText);
            setErrorDetails(`Status: ${response.status}, Response: ${errorText}`);
            throw new Error(`API error (${response.status}): ${errorText}`);
          }

          const data = await response.json();
          
          if (data.error) {
            console.error('Error creating link token:', data.error);
            setErrorDetails(`Error from API: ${data.error}`);
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "Failed to initialize Plaid Link. Please try again."
            });
            onExit();
            return;
          }

          const linkToken = data.link_token;
          console.log('Link token received successfully');

          // Load the Plaid Link script
          script = document.createElement('script');
          script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
          script.async = true;
          script.onload = () => {
            // Initialize Plaid Link
            console.log('Plaid script loaded, initializing handler');
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
                  console.log('Plaid Link loaded, opening UI');
                  // Open the Plaid Link interface automatically
                  handler.open();
                },
                countryCodes: ['GB'], // Restrict to UK banks only
                language: 'en', // Use English language
              });
            } else {
              console.error('Plaid not loaded');
              setErrorDetails('Plaid library failed to load');
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load Plaid. Please try again."
              });
              setIsLoading(false);
              onExit();
            }
          };
          
          document.head.appendChild(script);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setErrorDetails(`Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to connect to Plaid. Please try again later."
          });
          setIsLoading(false);
          onExit();
        }
      } catch (error) {
        console.error('Error initializing Plaid Link:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize Plaid Link. Please try again."
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExit()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your UK Bank</DialogTitle>
          <DialogDescription>
            {errorDetails ? 
              "Error connecting to your bank. Technical details below:" :
              "Loading the secure connection to your UK bank. This may take a moment..."}
          </DialogDescription>
        </DialogHeader>
        {errorDetails ? (
          <div className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs">
            <pre>{errorDetails}</pre>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onExit} disabled={isLoading && !errorDetails}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
