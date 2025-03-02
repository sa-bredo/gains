
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
  FileSignature,
  MapPin,
  Clock
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
    title: "Rota",
    url: "/rota",
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
