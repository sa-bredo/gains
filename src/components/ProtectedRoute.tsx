
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { currentCompany, isLoadingCompanies } = useCompany();
  const location = useLocation();

  // Show loading state while Clerk is initializing or companies are loading
  if (!isLoaded || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to company selection if authenticated but no company selected
  if (!currentCompany && !location.pathname.includes('/select-company')) {
    return <Navigate to="/select-company" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
