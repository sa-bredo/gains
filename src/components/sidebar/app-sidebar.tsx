
import React from "react";
import { MainNavigation } from "./main-navigation";
import { SidebarContent, SidebarFooter, SidebarHeader, Sidebar, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import { Lightbulb, Search, Shield } from "lucide-react";
import { SidebarNavItem } from "./nav-item";
import { NavItem } from "./types";
import { useCompany } from "@/contexts/CompanyContext";

// Discovery section navigation items
const discoverNavItems: NavItem[] = [
  {
    title: "Knowledge",
    url: "/knowledge",
    icon: Search,
    items: []
  },
  {
    title: "Learn About Us",
    url: "/about",
    icon: Lightbulb,
    items: []
  },
  {
    title: "Permissions",
    url: "/settings/permissions",
    icon: Shield,
    items: []
  }
];

export function AppSidebar() {
  const { currentCompany } = useCompany();
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex flex-col items-start px-4">
          <img 
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-16 w-auto" 
          />
          {currentCompany && (
            <span className="font-medium text-sm text-primary mt-1 mb-0.5 text-left">
              {currentCompany.name}
            </span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <MainNavigation />
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarMenu>
            {discoverNavItems.map((item) => (
              <SidebarNavItem key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
