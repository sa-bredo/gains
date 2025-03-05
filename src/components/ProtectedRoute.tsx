
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

export type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { currentCompany, isLoadingCompanies } = useCompany();
  const location = useLocation();

  // Show loading state while auth is initializing or companies are loading
  if (isLoadingAuth || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to company selection if authenticated but no company selected
  if (!currentCompany && !location.pathname.includes('/select-company')) {
    console.log("No company selected, redirecting to company selection");
    return <Navigate to="/select-company" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
