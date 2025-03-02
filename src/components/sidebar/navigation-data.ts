
import {
  Activity,
  BarChart,
  Calendar,
  DollarSign,
  FileText,
  Heart,
  Lightbulb,
  ListTodo,
  Search,
  Settings,
  Briefcase,
  Users,
} from "lucide-react";
import { NavItem } from "./types";

// We're not hardcoding user information anymore - it will be fetched from auth context
export const navMain: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Activity,
    isActive: true,
    items: [
      {
        title: "Overview",
        url: "/dashboard",
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
      },
      {
        title: "Progress",
        url: "/dashboard/progress",
      },
    ],
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: ListTodo,
    items: [
      {
        title: "My Tasks",
        url: "/tasks",
      },
      {
        title: "Assigned Tasks",
        url: "/tasks/assigned",
      },
    ],
  },
  {
    title: "Documents",
    url: "/document-signing",
    icon: FileText,
    items: [
      {
        title: "Templates",
        url: "/document-signing",
      },
      {
        title: "Sent Documents",
        url: "/document-signing/sent",
      },
    ],
  },
  {
    title: "Financials",
    url: "/financials/transactions",
    icon: DollarSign,
    items: [
      {
        title: "Transactions",
        url: "/financials/transactions",
      },
      {
        title: "GoCardless",
        url: "/financials/transactions-gocardless",
      },
    ],
  },
  {
    title: "Rota",
    url: "/rota/shifts",
    icon: Calendar,
    items: [
      {
        title: "Shifts",
        url: "/rota/shifts",
      },
      {
        title: "Shift Templates",
        url: "/rota/shift-templates-master",
      },
    ],
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: DollarSign,
    items: [],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
    items: [],
  },
  {
    title: "Operations",
    url: "/operations",
    icon: Briefcase,
    items: [],
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
    items: [],
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/settings/account",
      },
      {
        title: "Locations",
        url: "/settings/locations",
      },
      {
        title: "Config",
        url: "/settings/config",
      },
    ],
  },
];

// Add the Discovery section items
export const navDiscover: NavItem[] = [
  {
    title: "Knowledge",
    url: "/knowledge",
    icon: Search,
    items: [],
  },
  {
    title: "Learn About Us",
    url: "/about",
    icon: Lightbulb,
    items: [],
  },
];
