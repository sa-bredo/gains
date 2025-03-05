
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { currentCompany, isLoadingCompanies, refreshCompanies, userCompanies } = useCompany();
  const location = useLocation();
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // Attempt to refresh companies if none are loaded after authentication
  useEffect(() => {
    const attemptRefresh = async () => {
      if (isLoaded && isSignedIn && !currentCompany && !isLoadingCompanies && !hasAttemptedRefresh) {
        setHasAttemptedRefresh(true);
        try {
          await refreshCompanies();
        } catch (error) {
          console.error("Error refreshing companies in ProtectedRoute:", error);
          toast.error("Failed to load company information. Please try again.");
        }
      }
    };

    attemptRefresh();
  }, [isLoaded, isSignedIn, currentCompany, isLoadingCompanies, refreshCompanies, hasAttemptedRefresh]);

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

  // Debug logging outside conditional logic
  console.log("Current path:", location.pathname);
  console.log("User companies count:", userCompanies.length);
  console.log("Current company:", currentCompany ? currentCompany.name : "None");

  // If we're already on create-company page, just render the page
  if (location.pathname === '/create-company') {
    return children ? <>{children}</> : <Outlet />;
  }

  // If authenticated but no company selected and not already on select-company page
  if (!currentCompany && !location.pathname.includes('/select-company')) {
    if (userCompanies.length === 0) {
      console.log("No companies available, redirecting to create company page");
      return <Navigate to="/create-company" state={{ from: location }} replace />;
    } else {
      console.log("No company selected, redirecting to company selection");
      return <Navigate to="/select-company" state={{ from: location }} replace />;
    }
  }

  // If we have a company selected, proceed with the protected route
  return children ? <>{children}</> : <Outlet />;
};
