
import { useEffect } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If the user is signed in, redirect them to the dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);
  
  // If Clerk is still loading, show a loading state
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }
  
  // Show the home page for non-authenticated users
  if (!isSignedIn) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-36 w-auto mb-2"
            style={{ maxWidth: '50%' }}
          />
          <h1 className="text-3xl font-bold">Welcome</h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Please sign in to access the dashboard and company resources.
        </p>
        <Button asChild>
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }
  
  // This is a fallback that should rarely be reached
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Redirecting to dashboard...</span>
    </div>
  );
}
