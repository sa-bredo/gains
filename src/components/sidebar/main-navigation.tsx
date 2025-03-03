
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

// Updated navigation items to match actual application routes with detailed sub-items
const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Activity,
    url: "/",
    isActive: true,
    items: []
  },
  {
    title: "Employees",
    icon: Users,
    url: "/employees",
    items: [
      { title: "All Employees", url: "/employees" },
      { title: "Invite Employee", url: "/employees/invite" }
    ]
  },
  {
    title: "Documents",
    icon: FileText,
    url: "/documents",
    items: [
      { title: "All Documents", url: "/documents" },
      { title: "Templates", url: "/document-signing" },
      { title: "Sent Documents", url: "/document-signing/sent" }
    ]
  },
  {
    title: "Financials",
    icon: DollarSign,
    url: "/plaid",
    items: [
      { title: "Plaid", url: "/plaid" },
      { title: "Transactions", url: "/financials/transactions" },
      { title: "GoCardless", url: "/financials/transactions-gocardless" }
    ]
  },
  {
    title: "Rota",
    icon: Calendar,
    url: "/rota",
    items: [
      { title: "Overview", url: "/rota" },
      { title: "Shifts", url: "/rota/shifts" },
      { title: "Shift Templates", url: "/rota/shift-templates" },
      { title: "Shift Templates Master", url: "/rota/shift-templates-master" }
    ]
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
      { title: "Locations", url: "/settings/locations" },
      { title: "Permissions", url: "/settings/permissions" },
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
