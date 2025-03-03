
import React from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const { currentCompany, isLoadingCompanies } = useCompany();

  if (isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
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
  );
};

export default Dashboard;
