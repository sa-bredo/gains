
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  url: string;
  items?: NavSubItem[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}
