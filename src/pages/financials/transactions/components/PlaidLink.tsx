
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogErrorDetails } from "@/components/ui/dialog";
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
        console.log('Requesting link token from hardcoded URL:', apiUrl);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });

          // Get detailed error information
          let errorText = '';
          try {
            errorText = await response.text();
            console.log('Raw API response:', errorText);
          } catch (textError) {
            errorText = 'Failed to get response text: ' + (textError instanceof Error ? textError.message : String(textError));
          }

          if (!response.ok) {
            console.error('API response error:', response.status, errorText);
            setErrorDetails(`Status: ${response.status}, Body: ${errorText}`);
            throw new Error(`API error (${response.status}): ${errorText}`);
          }

          let data;
          try {
            data = JSON.parse(errorText);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError, 'Raw:', errorText);
            setErrorDetails(`Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}, Raw: ${errorText}`);
            throw new Error('Invalid response from server. Please try again.');
          }
          
          if (data.error) {
            console.error('Error creating link token:', data.error);
            setErrorDetails(`Error from API: ${data.error}`);
            const errorMessage = data.error || "Failed to initialize Plaid Link. Please try again.";
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage
            });
            onExit();
            return;
          }

          const linkToken = data.link_token;
          console.log('Link token received:', linkToken);

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
                  console.log('Plaid Link success', public_token, metadata);
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
                countryCodes: ['GB'], // Restrict to UK banks only
                language: 'en', // Use English language
              });
            } else {
              console.error('Plaid not loaded');
              setErrorDetails('Plaid library failed to load');
              const errorMessage = "Failed to load Plaid. Please try again.";
              toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage
              });
              setIsLoading(false);
              onExit();
            }
          };
          
          document.head.appendChild(script);
        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setErrorDetails(`Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
          throw fetchError;
        }
      } catch (error) {
        console.error('Error initializing Plaid Link:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize Plaid Link. Please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
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
          <DialogErrorDetails errorDetails={errorDetails} />
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
