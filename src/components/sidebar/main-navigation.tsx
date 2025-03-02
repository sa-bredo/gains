
import { FC } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavItem } from "./types";
import { SidebarNavItem } from "./nav-item";
import { 
  Activity, 
  BarChart3, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  FileText, 
  Heart, 
  Home, 
  Lightbulb, 
  ListTodo, 
  Search, 
  Settings, 
  Users 
} from "lucide-react";

interface MainNavigationProps {
  items?: NavItem[];
}

// Default navigation items to use if none are provided
const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Activity,
    url: "/dashboard",
    isActive: true,
    items: [
      { title: "Overview", url: "/dashboard" },
      { title: "Analytics", url: "/dashboard/analytics" }
    ]
  },
  {
    title: "Tasks",
    icon: ListTodo,
    url: "/tasks",
    items: [
      { title: "My Tasks", url: "/tasks" },
      { title: "Assigned Tasks", url: "/tasks/assigned" }
    ]
  },
  {
    title: "Documents",
    icon: FileText,
    url: "/document-signing",
    items: [
      { title: "Templates", url: "/document-signing" },
      { title: "Sent Documents", url: "/document-signing/sent" }
    ]
  },
  {
    title: "Financials",
    icon: DollarSign,
    url: "/financials/transactions",
    items: [
      { title: "Transactions", url: "/financials/transactions" },
      { title: "GoCardless", url: "/financials/transactions-gocardless" }
    ]
  },
  {
    title: "Rota",
    icon: Calendar,
    url: "/rota/shifts",
    items: [
      { title: "Shifts", url: "/rota/shifts" },
      { title: "Shift Templates", url: "/rota/shift-templates-master" }
    ]
  },
  {
    title: "Payroll",
    icon: DollarSign,
    url: "/payroll",
    items: []
  },
  {
    title: "Analytics",
    icon: BarChart3,
    url: "/analytics",
    items: []
  },
  {
    title: "Operations",
    icon: Briefcase,
    url: "/operations",
    items: []
  },
  {
    title: "Team",
    icon: Users,
    url: "/team",
    items: [
      { title: "All Team", url: "/team" }
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings",
    items: [
      { title: "Account", url: "/settings/account" },
      { title: "Locations", url: "/settings/locations" },
      { title: "Config", url: "/settings/config" }
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
