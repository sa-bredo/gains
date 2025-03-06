
import React, { useEffect, useRef } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2, AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { currentCompany, isLoadingCompanies, refreshCompanies } = useCompany();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const hasAttemptedRefresh = useRef(false);
  const isMounted = useRef(true);
  const redirectTimeout = useRef<number | null>(null);

  // Set up mounting tracker
  useEffect(() => {
    console.log("Dashboard component mounted");
    isMounted.current = true;
    
    return () => {
      console.log("Dashboard component unmounting");
      isMounted.current = false;
      
      // Clear any pending timeouts when unmounting
      if (redirectTimeout.current) {
        window.clearTimeout(redirectTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    // Redirect to login if not signed in and Clerk is loaded
    if (isLoaded && !isSignedIn) {
      console.log("User not signed in, redirecting to login");
      navigate("/login");
      return;
    }

    // If no company and we're not currently loading, try one refresh
    if (isLoaded && isSignedIn && !currentCompany && !isLoadingCompanies && !hasAttemptedRefresh.current) {
      hasAttemptedRefresh.current = true;
      
      const attemptRefresh = async () => {
        console.log("Dashboard attempting to refresh companies");
        try {
          await refreshCompanies();
          
          // Set a timeout to check if we still don't have a company after refresh
          if (!isMounted.current) return;
          
          redirectTimeout.current = window.setTimeout(() => {
            if (!isMounted.current) return;
            
            console.log("After refresh, checking if company exists:", {
              currentCompany: !!currentCompany,
              isLoaded,
              isSignedIn
            });
            
            if (!currentCompany) {
              console.log("Still no company after refresh, redirecting to select-company");
              toast.info("Please select a company to continue");
              navigate("/select-company", { replace: true });
            }
          }, 2000);
          
        } catch (error) {
          console.error("Error refreshing companies in Dashboard:", error);
          toast.error("Failed to load company information");
          navigate("/select-company", { replace: true });
        }
      };
      
      attemptRefresh();
    }
  }, [isLoaded, isSignedIn, navigate, currentCompany, isLoadingCompanies, refreshCompanies]);

  // Add a loading timeout to prevent infinite loading
  useEffect(() => {
    // If we're still loading after 10 seconds, something might be wrong
    if (isLoaded && isSignedIn && isLoadingCompanies) {
      const loadingTimeout = window.setTimeout(() => {
        if (!isMounted.current) return;
        
        if (isLoadingCompanies) {
          console.log("Loading companies timed out in Dashboard, redirecting to select-company");
          toast.error("Loading took too long. Please try again.");
          navigate("/select-company", { replace: true });
        }
      }, 10000); // 10 second timeout
      
      return () => {
        window.clearTimeout(loadingTimeout);
      };
    }
  }, [isLoaded, isSignedIn, isLoadingCompanies, navigate]);

  // Log the current state for debugging
  useEffect(() => {
    console.log("Dashboard state:", {
      hasCompany: !!currentCompany,
      companyName: currentCompany?.name || "None",
      isLoading: isLoadingCompanies,
      isAuthenticated: isSignedIn,
      hasAttemptedRefresh: hasAttemptedRefresh.current
    });
  }, [currentCompany, isLoadingCompanies, isSignedIn]);

  if (!isLoaded || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // If no current company, redirect to select company
  if (!currentCompany) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Company Selected</h1>
          <p className="text-muted-foreground mb-6">
            Please select a company to continue using the dashboard.
          </p>
          <button 
            onClick={() => navigate("/select-company")}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Select Company
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
              {currentCompany?.name} Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2">Welcome</h2>
                <p>This is your dashboard. You can navigate to other pages using the sidebar.</p>
              </div>
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
                <p>Your recent activity will appear here.</p>
              </div>
              <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
                <p>Quick actions will be available here soon.</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
