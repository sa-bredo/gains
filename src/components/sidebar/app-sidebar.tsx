
import React from "react";
import { MainNavigation } from "./main-navigation";
import { SidebarContent, SidebarFooter, SidebarHeader, Sidebar } from "@/components/ui/sidebar";
import { UserProfile } from "./user-profile";
import { CompanySwitcher } from "@/components/company-switcher";

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
      </SidebarContent>
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
