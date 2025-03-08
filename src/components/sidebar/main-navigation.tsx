
import { FC } from "react";
import { useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavItem, NavSubItem } from "./types";
import { SidebarNavItem } from "./nav-item";
import { 
  Activity, 
  CalendarDays, 
  DollarSign, 
  FileText, 
  Settings, 
  Users,
  MapPin,
  FormInput,
  MessageSquare
} from "lucide-react";

interface MainNavigationProps {
  items?: NavItem[];
}

// Navigation items to match actual application routes
const defaultNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Activity,
    url: "/dashboard",
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
    url: "/document-signing",
    items: [
      { title: "Templates", url: "/document-signing" }
    ]
  },
  {
    title: "Forms",
    icon: FormInput,
    url: "/forms",
    items: [
      { title: "Form Builder", url: "/forms" }
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
    icon: CalendarDays,
    url: "/rota/shifts",
    items: [
      { title: "Shifts", url: "/rota/shifts" },
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
    url: "/settings/config",
    items: [
      { title: "Locations", url: "/settings/locations" },
      { title: "Permissions", url: "/settings/permissions" },
      { title: "Config", url: "/settings/config" },
      { title: "Integrations", url: "/settings/integrations/slack", 
        items: [
          { title: "Slack", url: "/settings/integrations/slack" }
        ] 
      }
    ]
  }
];

export const MainNavigation: FC<MainNavigationProps> = ({ items = defaultNavItems }) => {
  const location = useLocation();
  
  // Mark items as active based on current location
  const navItems = items.map(item => {
    // Check if this item or any of its subitems match the current path
    const isActive = location.pathname === item.url || 
                    (item.items?.some(subItem => {
                      // Direct match
                      if (location.pathname === subItem.url) return true;
                      // Check nested items
                      if (subItem.items?.some(nestedItem => location.pathname === nestedItem.url)) return true;
                      return false;
                    }) || false);
    
    return {
      ...item,
      isActive
    };
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarNavItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
