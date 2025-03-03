
import { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  
  // If Clerk is still loading, show a loading state
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
  // Redirect based on authentication status
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-12 w-auto mb-2"
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
}
