
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface GoCardlessLinkProps {
  onSuccess: (redirectUrl: string, metadata: any) => void;
  onExit: () => void;
  isOpen: boolean;
}

export function GoCardlessLink({ onSuccess, onExit, isOpen }: GoCardlessLinkProps) {
  const { toast } = useToast();
  const { isAuthenticated, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
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
    
    const initGoCardlessLink = async () => {
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

        console.log('User is authenticated, proceeding with GoCardless connection');
        
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
        const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/create-gocardless-link";
        console.log('Requesting GoCardless link from hardcoded URL:', apiUrl);
        
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
            console.error('Error creating GoCardless link:', data.error);
            setErrorDetails(`Error from API: ${data.error}`);
            const errorMessage = data.error || "Failed to initialize GoCardless Link. Please try again.";
            toast({
              variant: "destructive",
              title: "Error",
              description: errorMessage
            });
            onExit();
            return;
          }

          // Get the redirect URL from the response
          const redirectUrl = data.redirect_url;
          console.log('GoCardless redirect URL received:', redirectUrl);
          setRedirectUrl(redirectUrl);

        } catch (fetchError) {
          console.error('Fetch error:', fetchError);
          setErrorDetails(`Fetch error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
          throw fetchError;
        }
      } catch (error) {
        console.error('Error initializing GoCardless Link:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize GoCardless Link. Please try again.";
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
        setIsLoading(false);
        onExit();
      } finally {
        setIsLoading(false);
      }
    };

    initGoCardlessLink();
  }, [isOpen, isAuthenticated]);

  const handleGoToBank = () => {
    if (redirectUrl) {
      // Here we would pass the redirect URL and any metadata to the parent component
      onSuccess(redirectUrl, { timestamp: new Date().toISOString() });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExit()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your UK Bank via GoCardless</DialogTitle>
          <DialogDescription>
            {errorDetails ? 
              "Error connecting to your bank. Technical details below:" :
              redirectUrl ? 
                "Your bank connection is ready. Click below to continue to your bank." :
                "Preparing the secure connection to your UK bank. This may take a moment..."
            }
          </DialogDescription>
        </DialogHeader>
        {errorDetails ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-2 mb-4 text-sm text-red-800 font-mono overflow-x-auto">
            <p className="font-bold mb-1">Error Details:</p>
            <pre className="whitespace-pre-wrap">{errorDetails}</pre>
          </div>
        ) : redirectUrl ? (
          <div className="flex flex-col items-center justify-center py-4">
            <p className="mb-4 text-center">
              You'll be redirected to your bank's website to complete the connection process.
            </p>
            <Button onClick={handleGoToBank} className="w-full">Continue to Bank</Button>
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
