
import React from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Loader2 } from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarInset
} from "@/components/ui/sidebar";
import { 
  Home, 
  Users, 
  CalendarDays, 
  FileText,
  Settings,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar side="left" variant="sidebar">
          <SidebarHeader>
            <div className="flex items-center px-2">
              <img 
                src="https://images.squarespace-cdn.com/content/v1/66dfede09053481feac2a1aa/1725951490906-BM3OIHGXHDGQNEZRAU74/SA_whitegb.png?format=1500w" 
                alt="Studio Anatomy Logo" 
                className="h-8 w-auto"
              />
              <span className="ml-2 font-semibold text-lg">{currentCompany?.name}</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={true} tooltip="Dashboard">
                      <Link to="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Team">
                      <Link to="/team">
                        <Users className="h-4 w-4" />
                        <span>Team</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Rota">
                      <Link to="/rota">
                        <CalendarDays className="h-4 w-4" />
                        <span>Rota</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Documents">
                      <Link to="/documents">
                        <FileText className="h-4 w-4" />
                        <span>Documents</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Financials">
                      <Link to="/plaid">
                        <CreditCard className="h-4 w-4" />
                        <span>Financials</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings">
                      <Link to="/settings/config">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="p-2 text-xs text-muted-foreground">
              {currentCompany?.name} • {new Date().getFullYear()}
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
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
