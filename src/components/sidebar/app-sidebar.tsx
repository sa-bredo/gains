
import React from "react";
import { MainNavigation } from "./main-navigation";
import { SidebarContent, SidebarFooter, SidebarHeader, Sidebar, SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import { CompanySwitcher } from "@/components/company-switcher";
import { Lightbulb, Search } from "lucide-react";
import { SidebarNavItem } from "./nav-item";
import { NavItem } from "./types";

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
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-2">
          <CompanySwitcher />
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
