
import {
  Heart,
  Brain,
  ScrollText,
  Layers,
  Users,
  Settings,
  Activity,
  Search,
  Lightbulb,
  Calendar,
  DollarSign,
  BarChart,
  Briefcase,
  ListCheck,
  BanknoteIcon,
  FileSignature
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
    url: "/table-example",
    icon: ListCheck,
    items: [
      {
        title: "All Tasks",
        url: "/table-example",
      },
      {
        title: "My Tasks",
        url: "/table-example?filter=my",
      },
      {
        title: "Assigned",
        url: "/table-example?filter=assigned",
      },
    ],
  },
  {
    title: "Documents",
    url: "/document-signing",
    icon: FileSignature,
    items: [
      {
        title: "Sign Documents",
        url: "/document-signing",
      },
    ],
  },
  {
    title: "Financials",
    url: "/financials",
    icon: DollarSign,
    items: [
      {
        title: "Transactions",
        url: "/financials/transactions",
      }
    ],
  },
  {
    title: "Rota",
    url: "/rota",
    icon: Calendar,
    items: [
      {
        title: "Schedule",
        url: "/rota/schedule",
      },
      {
        title: "Staff",
        url: "/rota/staff",
      },
      {
        title: "Leave",
        url: "/rota/leave",
      },
    ],
  },
  {
    title: "Payroll",
    url: "/payroll",
    icon: DollarSign,
    items: [
      {
        title: "Salaries",
        url: "/payroll/salaries",
      },
      {
        title: "Expenses",
        url: "/payroll/expenses",
      },
      {
        title: "Reports",
        url: "/payroll/reports",
      },
    ],
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
    items: [
      {
        title: "Performance",
        url: "/analytics/performance",
      },
      {
        title: "Trends",
        url: "/analytics/trends",
      },
      {
        title: "Forecasts",
        url: "/analytics/forecasts",
      },
    ],
  },
  {
    title: "Operations",
    url: "/operations",
    icon: Briefcase,
    items: [
      {
        title: "Processes",
        url: "/operations/processes",
      },
      {
        title: "Resources",
        url: "/operations/resources",
      },
      {
        title: "Management",
        url: "/operations/management",
      },
    ],
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
    items: [
      {
        title: "All Team",
        url: "/team",
      },
    ],
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
        title: "Preferences",
        url: "/settings/preferences",
      },
      {
        title: "Notifications",
        url: "/settings/notifications",
      },
    ],
  },
];
