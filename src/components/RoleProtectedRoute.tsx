
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

type RoleProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: UserRole | UserRole[];
  redirectTo?: string;
};

export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/dashboard" 
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being verified
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if user doesn't have the required role
  if (!hasRole(allowedRoles)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // User is authenticated and has the required role, render the children
  return <>{children}</>;
};
