
import * as React from "react";
import { Heart } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { useSidebar } from "./sidebar-hook";
import { UserProfileMenu } from "./user-profile";
import { MainNavigation } from "./main-navigation";
import { DiscoverSection } from "./discover-section";
import { navMain, user } from "./navigation-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Heart className="h-5 w-5 text-primary" />
                <span>Studio Anatomy</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNavigation items={navMain} />
        <DiscoverSection />
      </SidebarContent>
      <SidebarFooter>
        <UserProfileMenu user={user} isMobile={isMobile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
