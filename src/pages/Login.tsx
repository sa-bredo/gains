
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, Building, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";

// Define an explicit interface for login credentials to avoid TypeScript issues
interface LoginCredentials {
  identifier: string;
  password: string;
}

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Redirect if user is already signed in
  if (isLoaded && isSignedIn) {
    setIsRedirecting(true);
    navigate("/settings/locations");
    return null;
  }
  
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to locations...</h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !companyName) {
      setError("Please enter email, password, and company name");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      if (!signIn) {
        throw new Error("Sign in not available");
      }

      // Query company data using name instead of slug
      const { data, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('name', companyName)
        .limit(1);

      // Check for query errors
      if (companyError) {
        console.error("Company lookup error:", companyError);
        setError("Error checking company name. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      // Check if company exists by checking if data array has any items
      if (!data || data.length === 0) {
        setError(`Company "${companyName}" not found. Please check and try again.`);
        setIsSubmitting(false);
        return;
      }
      
      // Create a credentials object with explicitly typed interface
      const credentials: LoginCredentials = {
        identifier: email,
        password: password
      };
      
      // Use the explicit interface for the result type
      const result = await signIn.create(credentials);
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Store company name in local storage instead of slug
        localStorage.setItem('currentCompanyName', companyName);
        
        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        });
        navigate("/settings/locations");
      } else {
        // This shouldn't happen with email/password auth
        setError("Something went wrong. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.errors?.[0]?.message || "Invalid email or password");
      toast({
        title: "Login failed",
        description: err.errors?.[0]?.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded || !isSignInLoaded) {
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
          <h2 className="text-2xl font-bold text-center mb-6">Sign in to your account</h2>
          
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Studio Anatomy"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
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
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
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
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
