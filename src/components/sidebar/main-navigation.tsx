
import { FC } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { NavItem } from "./types";
import { SidebarNavItem } from "./nav-item";

interface MainNavigationProps {
  items: NavItem[];
}

export const MainNavigation: FC<MainNavigationProps> = ({ items }) => {
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
