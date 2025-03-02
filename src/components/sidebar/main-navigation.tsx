
import { FC } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavItem } from "./types";
import { SidebarNavItem } from "./nav-item";
import { BarChart3, Home, Settings, Users } from "lucide-react";

interface MainNavigationProps {
  items?: NavItem[];
}

// Default navigation items to use if none are provided
const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    url: "/dashboard",
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" }
    ]
  },
  {
    title: "Team",
    icon: Users,
    url: "/team",
    items: [
      { title: "Members", url: "/team" },
      { title: "Settings", url: "/team/settings" }
    ]
  },
  {
    title: "Reports",
    icon: BarChart3,
    url: "/reports",
    items: [
      { title: "Performance", url: "/reports/performance" },
      { title: "Finance", url: "/reports/finance" }
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
    items: [
      { title: "General", url: "/settings" },
      { title: "Security", url: "/settings/security" },
      { title: "Notifications", url: "/settings/notifications" }
    ]
  }
];

export const MainNavigation: FC<MainNavigationProps> = ({ items = defaultNavItems }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarNavItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
