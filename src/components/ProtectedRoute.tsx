
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

export type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { currentCompany, isLoadingCompanies, refreshCompanies } = useCompany();
  const location = useLocation();

  // If auth or companies are still loading, show loading state
  if (!isLoaded || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
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
