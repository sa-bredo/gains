
import { FC } from "react";
import { Link } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavItem } from "./types";

interface DiscoverSectionProps {
  items: NavItem[];
}

export const DiscoverSection: FC<DiscoverSectionProps> = ({ items }) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Discover</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
