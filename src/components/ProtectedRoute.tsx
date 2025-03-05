
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

export type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { currentCompany, isLoadingCompanies, refreshCompanies } = useCompany();
  const location = useLocation();

  // If auth or companies are still loading, show loading state
  if (isLoadingAuth || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location for future redirect
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no company selected and not already on select-company page
  if (!currentCompany && !location.pathname.includes('/select-company')) {
    console.log("No company selected, redirecting to company selection");
    return <Navigate to="/select-company" state={{ from: location }} replace />;
  }

  // If we have a company selected, try to refresh company data if needed
  if (isAuthenticated && !isLoadingCompanies && currentCompany) {
    // We're good to proceed with the protected route
    return children ? <>{children}</> : <Outlet />;
  }

  // This is a fallback that shouldn't normally be reached
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">Preparing your dashboard...</span>
    </div>
  );
};
