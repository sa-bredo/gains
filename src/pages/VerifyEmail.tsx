import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp, isLoaded } = useSignUp();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    // Get email from URL query params
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, redirect to signup
      navigate("/signup");
    }
  }, [location, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      if (!signUp) {
        throw new Error("Sign up not available");
      }
      
      // Attempt to verify code
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (result.status === "complete") {
        // Email verified successfully
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully.",
        });
        
        try {
          // Fixed: Use setActive instead of createSession
          if (result.createdSessionId) {
            await signUp.setActive({ session: result.createdSessionId });
          }
          
          // Redirect to company selection
          navigate("/select-company");
        } catch (sessionError) {
          console.error("Session creation error:", sessionError);
          toast({
            title: "Session error",
            description: "Your email was verified, but we had trouble creating your session. Please try logging in.",
            variant: "destructive",
          });
          navigate("/login");
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.errors?.[0]?.message || "Error verifying email. Please try again.");
      toast({
        title: "Verification failed",
        description: err.errors?.[0]?.message || "Error verifying email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = async () => {
    try {
      if (!signUp) {
        throw new Error("Sign up not available");
      }
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err: any) {
      console.error("Error resending code:", err);
      toast({
        title: "Error resending code",
        description: err.errors?.[0]?.message || "Error resending verification code. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/66dfede09053481feac2a1aa/1725951490906-BM3OIHGXHDGQNEZRAU74/SA_whitegb.png?format=1500w" 
            alt="Studio Anatomy Logo" 
            className="h-8 w-auto"
          />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-md border border-border">
          <button 
            onClick={() => navigate("/signup")} 
            className="text-sm text-primary flex items-center mb-4"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Sign Up
          </button>
          
          <h2 className="text-2xl font-bold text-center mb-6">Verify your email</h2>
          
          <div className="text-center mb-6">
            <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">
              We've sent a verification code to <strong>{email}</strong>. 
              Please check your inbox and enter the code below.
            </p>
          </div>
          
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="verificationCode" className="text-sm font-medium">
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the code from your email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isSubmitting}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button 
                type="button" 
                onClick={handleResendCode} 
                className="text-primary hover:underline"
              >
                Resend code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
