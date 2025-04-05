
import { useEffect, useState } from "react";
import { supabase, createTemporaryAuthToken } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

interface PlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  isOpen: boolean;
}

export function PlaidLink({ onSuccess, onExit, isOpen }: PlaidLinkProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  // Fix: Use the correct properties from useClerk()
  const { session: clerkSession } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    
    let script: HTMLScriptElement;
    const initPlaidLink = async () => {
      try {
        setIsLoading(true);
        setErrorDetails(null);
        
        // Check authentication
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
        
        // Try to get a session for API access
        let authHeader: string | null = null;
        
        // First try to get an existing Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.log('Session not found despite authentication:', sessionError);
          
          // Since we can't use anonymous auth, try to get a token from Clerk
          try {
            console.log('Attempting to get Clerk token for API authentication');
            // Fix: Don't use getToken() which doesn't exist
            const clerkToken = clerkSession?.token;
            
            if (clerkToken) {
              console.log('Clerk token obtained, using for API authentication');
              authHeader = `Bearer ${clerkToken}`;
            } else {
              // As a last resort, use the API key directly
              const tempToken = await createTemporaryAuthToken();
              if (tempToken) {
                console.log('Using temporary API key authentication');
                authHeader = `Bearer ${tempToken}`;
              } else {
                throw new Error('No authentication method available');
              }
            }
          } catch (authError) {
            console.error('Error setting up authentication:', authError);
            const errorMessage = "Authentication error. Please try again or refresh the page.";
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: errorMessage
            });
            onExit();
            return;
          }
        } else {
          // We have a valid Supabase session
          console.log('Using existing Supabase session for authentication');
          authHeader = `Bearer ${session.access_token}`;
        }
        
        if (!authHeader) {
          console.error('Failed to establish authentication');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Unable to authenticate with the API. Please try again later."
          });
          onExit();
          return;
        }

        // Hardcoded full URL to the Supabase function
        const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/create-link-token";
        console.log('Requesting link token from:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
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
