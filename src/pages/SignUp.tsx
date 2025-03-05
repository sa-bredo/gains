
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signUp, setActive, isLoaded: isSignUpLoaded } = useSignUp();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  if (isLoaded && isSignedIn) {
    setIsRedirecting(true);
    navigate("/select-company");
    return null;
  }
  
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill out all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      if (!signUp) {
        throw new Error("Sign up not available");
      }
      
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      });
      
      if (result.status === "complete" || result.status === "missing_requirements") {
        try {
          await result.update({
            firstName,
            lastName,
          });
        } catch (nameError) {
          console.error("Error setting user names:", nameError);
        }
      }
      
      await result.prepareEmailAddressVerification({ strategy: "email_code" });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Generate a UUID for the user in our Supabase system
        const newSupabaseUUID = crypto.randomUUID();
        
        // Create mapping between Clerk user ID and our Supabase UUID
        const { error: mappingError } = await supabase
          .from('clerk_user_mapping')
          .insert({
            clerk_user_id: result.createdUserId,
            supabase_user_id: newSupabaseUUID,
            email: email
          });
          
        if (mappingError) {
          console.error("Error creating user mapping:", mappingError);
          toast({
            title: "Error setting up user",
            description: "Your account was created but we couldn't set up your user profile.",
            variant: "destructive",
          });
        }
        
        toast({
          title: "Account created successfully",
          description: "Please select or join a company to continue.",
        });
        
        navigate("/select-company");
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.errors?.[0]?.message || "Error creating account. Please try again.");
      toast({
        title: "Sign up failed",
        description: err.errors?.[0]?.message || "Error creating account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded || !isSignUpLoaded) {
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
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-36 w-auto"
          />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
          
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-3"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
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
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must not have been found in any data breaches.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
