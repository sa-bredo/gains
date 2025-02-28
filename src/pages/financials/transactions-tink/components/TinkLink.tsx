
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface TinkLinkProps {
  onSuccess: (authorizationCode: string, state: string) => void;
  onExit: () => void;
  isOpen: boolean;
}

export function TinkLink({ onSuccess, onExit, isOpen }: TinkLinkProps) {
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

  // This function would normally open the Tink Link UI
  const openTinkLink = () => {
    console.log('Opening Tink Link UI');
    
    // Simulate a successful authentication with Tink
    // In a real implementation, this would launch the Tink Link UI and handle the callback
    setTimeout(() => {
      const mockAuthCode = "mock_auth_code_" + Date.now();
      const mockState = "mock_state_" + Date.now();
      onSuccess(mockAuthCode, mockState);
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const initTinkLink = async () => {
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

        // Get session for API calls
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

        // In a real implementation, we would get a link token from the backend
        // and then initialize the Tink Link UI
        openTinkLink();
        
      } catch (error) {
        console.error('Error initializing Tink Link:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to initialize Tink Link. Please try again.";
        setErrorDetails(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      }
    };

    initTinkLink();
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExit()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your UK Bank via Open Banking</DialogTitle>
          <DialogDescription>
            {errorDetails ? 
              "Error connecting to your bank. Technical details below:" :
              "Loading the secure connection to your UK bank via Tink Open Banking..."}
          </DialogDescription>
        </DialogHeader>
        
        {errorDetails ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-2 mb-4 text-sm text-red-800 font-mono overflow-x-auto">
            <p className="font-bold mb-1">Error Details:</p>
            <pre className="whitespace-pre-wrap">{errorDetails}</pre>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>You'll be redirected to select your bank and authorize access.</p>
              <p>This process is secure and uses Open Banking standards.</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onExit} disabled={isLoading && !errorDetails}>Cancel</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
