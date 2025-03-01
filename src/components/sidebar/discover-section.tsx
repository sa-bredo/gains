
import { FC } from "react";
import { Link } from "react-router-dom";
import { Search, Lightbulb } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export const DiscoverSection: FC = () => {
  return (
    <SidebarGroup className="mt-6">
      <SidebarGroupLabel>Discover</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/explore">
              <Search className="h-5 w-5" />
              <span>Knowledge</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/about">
              <Lightbulb className="h-5 w-5" />
              <span>Learn About Us</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};
