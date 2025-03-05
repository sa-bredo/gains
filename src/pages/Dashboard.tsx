
import React, { useEffect } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2, AlertCircle } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const Dashboard = () => {
  const { currentCompany, isLoadingCompanies } = useCompany();
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not signed in and Clerk is loaded
    if (isLoaded && !isSignedIn) {
      navigate("/login");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // If no current company, show error and link to select company
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
