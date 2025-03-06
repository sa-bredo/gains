import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { currentCompany, isLoadingCompanies, refreshCompanies, userCompanies } = useCompany();
  const location = useLocation();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    console.log("ProtectedRoute mounted");
    isMounted.current = true;
    
    return () => {
      console.log("ProtectedRoute unmounting");
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Attempt to refresh companies if none are loaded after authentication
  useEffect(() => {
    const attemptRefresh = async () => {
      if (!isMounted.current) return;
      
      if (isLoaded && isSignedIn && !currentCompany && !isLoadingCompanies && !hasAttemptedRefresh) {
        console.log("ProtectedRoute: No current company, attempting refresh");
        setHasAttemptedRefresh(true);
        try {
          console.log("Attempting to refresh companies for authenticated user");
          await refreshCompanies();
          
          // Set a timeout to check if we still don't have companies after refresh
          if (!isMounted.current) return;
          
          timeoutRef.current = window.setTimeout(() => {
            if (!isMounted.current) return;
            
            console.log("After refresh, checking companies state:", {
              hasCurrentCompany: !!currentCompany,
              companyCount: userCompanies.length,
              path: location.pathname
            });
            
            if (!currentCompany && userCompanies.length === 0 && !location.pathname.includes('/select-company')) {
              console.log("Still no companies after refresh, redirecting to select-company");
              toast.info("Please select or create a company to continue");
              // Force navigation to select company page if we really can't get any companies
              window.location.href = "/select-company";
            }
          }, 3000); // Allow 3 seconds for the refresh to complete
          
        } catch (error) {
          console.error("Error refreshing companies in ProtectedRoute:", error);
          toast.error("Failed to load company information. Please try again.");
        }
      }
    };

    attemptRefresh();
    
    // Cleanup timeout on dependency changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoaded, isSignedIn, currentCompany, isLoadingCompanies, refreshCompanies, hasAttemptedRefresh, userCompanies, location.pathname]);

  // Debug logging on company state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("Company state in ProtectedRoute:", {
        hasCompanies: userCompanies.length > 0,
        companyCount: userCompanies.length,
        currentCompany: currentCompany?.name || "None",
        currentPath: location.pathname,
        isLoadingCompanies
      });
    }
  }, [isLoaded, isSignedIn, userCompanies, currentCompany, location.pathname, isLoadingCompanies]);

  // Add a loading timeout to prevent infinite loading
  useEffect(() => {
    // If we're still loading after 10 seconds, something might be wrong
    if (isLoaded && isSignedIn && isLoadingCompanies) {
      const loadingTimeout = window.setTimeout(() => {
        if (!isMounted.current) return;
        
        if (isLoadingCompanies) {
          console.log("Loading companies timed out in ProtectedRoute");
          
          // If we're on the select-company page, force a refresh to break potential loops
          if (location.pathname === '/select-company') {
            console.log("On select-company page, forcing page refresh");
            window.location.reload();
          } else {
            // Otherwise redirect to select-company
            console.log("Redirecting to select-company due to timeout");
            toast.error("Loading took too long. Please try again.");
            window.location.href = "/select-company";
          }
        }
      }, 10000); // 10 second timeout
      
      return () => {
        clearTimeout(loadingTimeout);
      };
    }
  }, [isLoaded, isSignedIn, isLoadingCompanies, location.pathname]);

  // If auth or companies are still loading, show loading state
  if (!isLoaded || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <div className="text-center">
          <span className="text-lg font-medium">Loading your account...</span>
          <p className="text-muted-foreground mt-2">Please wait while we set things up.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location for future redirect
  if (!isSignedIn) {
    console.log("User not authenticated, redirecting to login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no company selected and not already on select-company page
  if (!currentCompany && !location.pathname.includes('/select-company')) {
    console.log("No company selected, redirecting to company selection");
    return <Navigate to="/select-company" state={{ from: location }} replace />;
  }

  // If we have a company selected, proceed with the protected route
  return children ? <>{children}</> : <Outlet />;
};
