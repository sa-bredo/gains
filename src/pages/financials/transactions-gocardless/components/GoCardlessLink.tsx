
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogErrorDetails } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BankSelector } from "./BankSelector";

interface Bank {
  id: string;
  name: string;
  logo: string;
  countries: string[];
  bic: string | null;
}

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
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [step, setStep] = useState<'selectBank' | 'connecting'>('selectBank');
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

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
  };

  const handleConnectBank = async () => {
    if (!selectedBank) {
      toast({
        variant: "destructive",
        title: "No bank selected",
        description: "Please select a bank to continue."
      });
      return;
    }

    setStep('connecting');
    await createBankConnection(selectedBank.id);
  };

  const createBankConnection = async (bankId: string) => {
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
      console.log('Selected bank ID:', bankId);
      
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
      console.log('Requesting GoCardless link from:', apiUrl);
      
      try {
        // Format the request payload with both parameters
        const requestPayload = {
          bank_id: bankId,          // Keep for backward compatibility
          institution_id: bankId     // This is the parameter used by GoCardless
        };
        
        console.log('Sending request payload:', JSON.stringify(requestPayload));
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestPayload)
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
      setStep('selectBank');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToBank = () => {
    if (redirectUrl) {
      // Here we would pass the redirect URL and any metadata to the parent component
      onSuccess(redirectUrl, { 
        timestamp: new Date().toISOString(),
        bankId: selectedBank?.id,
        bankName: selectedBank?.name,
        institutionId: selectedBank?.id // Include the institution ID in the metadata
      });
    }
  };

  // Reset state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      // Small delay to avoid flicker when reopening
      setTimeout(() => {
        setStep('selectBank');
        setErrorDetails(null);
        setRedirectUrl(null);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onExit()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Your Bank Account</DialogTitle>
          <DialogDescription>
            {step === 'selectBank' 
              ? "Select your bank to securely connect your account."
              : errorDetails 
                ? "Error connecting to your bank. Technical details below:" 
                : redirectUrl 
                  ? "Your bank connection is ready. Click below to continue to your bank."
                  : "Preparing the secure connection to your bank. This may take a moment..."}
          </DialogDescription>
        </DialogHeader>

        {step === 'selectBank' ? (
          <>
            <BankSelector onBankSelect={handleBankSelect} selectedBank={selectedBank} />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={onExit}>Cancel</Button>
              <Button 
                onClick={handleConnectBank} 
                disabled={!selectedBank}
                className="ml-2"
              >
                Connect Bank
              </Button>
            </div>
          </>
        ) : errorDetails ? (
          <>
            <DialogErrorDetails errorDetails={errorDetails} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={onExit}>Cancel</Button>
              <Button onClick={() => setStep('selectBank')}>
                Try Again
              </Button>
            </div>
          </>
        ) : redirectUrl ? (
          <>
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {selectedBank && (
                <div className="flex items-center mb-2">
                  {selectedBank.logo ? (
                    <img 
                      src={selectedBank.logo} 
                      alt={`${selectedBank.name} logo`} 
                      className="h-12 w-12 object-contain mr-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/gray/white?text=B';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                      {selectedBank.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-lg">{selectedBank.name}</span>
                </div>
              )}
              <p className="text-center">
                You'll be redirected to your bank's website to complete the connection process.
              </p>
              <Button onClick={handleGoToBank} className="w-full">Continue to Bank</Button>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline" onClick={onExit}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={onExit} disabled={isLoading}>Cancel</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
