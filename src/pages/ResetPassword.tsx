import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, AlertCircle, CheckCircle2, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const { signIn, setActive } = useSignIn();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successfulReset, setSuccessfulReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleResendCode = async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first");
      return;
    }
    
    try {
      setIsResending(true);
      setError("");
      
      if (!signIn) {
        throw new Error("Sign in not available");
      }
      
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      
      toast({
        title: "Code resent",
        description: "A new reset code has been sent to your email address.",
      });
      
      setResetCode("");
    } catch (err: any) {
      console.error("Resend code error:", err);
      setError(err.errors?.[0]?.message || "Failed to resend code. Please try again.");
      toast({
        title: "Failed to resend code",
        description: err.errors?.[0]?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!resetCode || resetCode.length < 6) {
      setError("Please enter the 6-digit code from your email");
      return;
    }
    
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!signIn) {
        throw new Error("Sign in not available");
      }
      
      // Attempt to reset with the code the user already has
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode,
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
      setError(err.errors?.[0]?.message || "Failed to reset password. Please check your code and try again.");
      toast({
        title: "Password reset failed",
        description: err.errors?.[0]?.message || "Please check your code and try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="resetCode" className="text-sm font-medium">
                  Reset Code
                </label>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || isSubmitting}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend code"}
                </button>
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter 6-digit code from email"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                  maxLength={6}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>

          <div className="text-center mt-4">
            <Link 
              to="/login" 
              className="text-sm text-primary hover:underline"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
