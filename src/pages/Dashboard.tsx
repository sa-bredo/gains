
import React from "react";
import { AppSidebar } from "@/components/sidebar";

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
      </main>
    </div>
  );
};

export default Dashboard;
