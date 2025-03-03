
import React from "react";
import { MainNavigation } from "./main-navigation";
import { SidebarContent, SidebarFooter, SidebarHeader, Sidebar, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import { Lightbulb, Search } from "lucide-react";
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
  }
];

export function AppSidebar() {
  const { currentCompany } = useCompany();
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
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
