import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const { signIn, setActive } = useSignIn();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successfulReset, setSuccessfulReset] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  
  const ticket = searchParams.get("__clerk_ticket");
  
  // Verify the ticket when component mounts
  useEffect(() => {
    const verifyTicket = async () => {
      if (!ticket) {
        setError("Invalid or missing reset token. Please request a new password reset link.");
        setIsVerifying(false);
        return;
      }
      
      // Ticket is valid if it exists, user can now set password
      setIsVerifying(false);
    };
    
    verifyTicket();
  }, [ticket]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (!ticket) {
      setError("Invalid reset token");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      if (!signIn) {
        throw new Error("Sign in not available");
      }
      
      // Reset password using the ticket from the email link
      // First, create the sign-in attempt with the code from the URL
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email || "",  // Email should come from the ticket context
      });
      
      // Then attempt to reset with the code and new password
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: ticket,
        password: password,
      });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccessfulReset(true);
        
        toast({
          title: "Password reset successful",
          description: "Your password has been updated. Redirecting to dashboard...",
        });
        
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.errors?.[0]?.message || "Failed to reset password. The link may have expired.");
      toast({
        title: "Password reset failed",
        description: err.errors?.[0]?.message || "Please request a new reset link",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isVerifying) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying reset link...</h1>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }
  
  if (successfulReset) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <img 
              src="/gains-logo.svg" 
              alt="Gains Logo" 
              className="h-36 w-auto" 
              style={{ maxWidth: '50%' }}
            />
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-md border border-border">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Password Reset Successful</h2>
              <p className="text-muted-foreground mb-4">
                Your password has been updated successfully. Redirecting to dashboard...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-36 w-auto" 
            style={{ maxWidth: '50%' }}
          />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold text-center mb-6">
            Reset your password
          </h2>
          
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {!ticket ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                This reset link is invalid or has expired.
              </p>
              <Link to="/login">
                <Button className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
              
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="text-sm text-primary hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
