
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Settings,
  Users,
  Clock,
  Building2,
  FileText,
  Activity,
  Briefcase,
  Compass,
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Sidebar aria-label="Application sidebar">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === "/"}
          >
            <Link to="/">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === "/explore"}
          >
            <Link to="/explore">
              <Compass className="h-4 w-4" />
              <span>Explore</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarGroup>
          <SidebarGroupLabel>Financials</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/financials/transactions"}
              >
                <Link to="/financials/transactions">
                  <CreditCard className="h-4 w-4" />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Schedule</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/schedule/calendar"}
              >
                <Link to="/schedule/calendar">
                  <Calendar className="h-4 w-4" />
                  <span>Calendar</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/schedule/timesheets"}
              >
                <Link to="/schedule/timesheets">
                  <Clock className="h-4 w-4" />
                  <span>Timesheets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Company</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/company/employees"}
              >
                <Link to="/company/employees">
                  <Users className="h-4 w-4" />
                  <span>Employees</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/company/locations"}
              >
                <Link to="/company/locations">
                  <Building2 className="h-4 w-4" />
                  <span>Locations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/company/documents"}
              >
                <Link to="/company/documents">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === "/reports"}
          >
            <Link to="/reports">
              <Activity className="h-4 w-4" />
              <span>Reports</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname === "/table-example"}
          >
            <Link to="/table-example">
              <Briefcase className="h-4 w-4" />
              <span>Table Example</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}
