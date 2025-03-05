
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Lock, Shield, ShieldCheck, Users } from "lucide-react";
import { NavItem } from "@/components/sidebar/types";

const permissionsNavItems: NavItem[] = [
  {
    title: "Role Permissions",
    url: "/settings/permissions",
    icon: Shield,
    items: []
  },
  {
    title: "User Permissions",
    url: "/settings/permissions/users",
    icon: Users,
    items: []
  },
  {
    title: "Access Control",
    url: "/settings/permissions/access",
    icon: Lock,
    items: []
  },
  {
    title: "Permission Presets",
    url: "/settings/permissions/presets",
    icon: ShieldCheck,
    items: []
  }
];

export function PermissionsSidebar() {
  const location = useLocation();
  
  // Mark active item based on current location
  const navItems = permissionsNavItems.map(item => {
    const isActive = location.pathname === item.url;
    return { ...item, isActive };
  });

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Permissions</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={item.isActive}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
