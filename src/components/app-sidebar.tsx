
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
  BanknoteIcon,
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Sidebar aria-label="Application sidebar">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            as={Link}
            to="/"
            isActive={pathname === "/"}
            icon={<LayoutDashboard className="h-4 w-4" />}
          >
            Dashboard
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            as={Link}
            to="/explore"
            isActive={pathname === "/explore"}
            icon={<Compass className="h-4 w-4" />}
          >
            Explore
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarGroup>
          <SidebarGroupLabel>Financials</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/financials/transactions"
                isActive={pathname === "/financials/transactions"}
                icon={<CreditCard className="h-4 w-4" />}
              >
                Transactions
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/financials/transactions-tink"
                isActive={pathname === "/financials/transactions-tink"}
                icon={<BanknoteIcon className="h-4 w-4" />}
              >
                Transactions via Tink
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Schedule</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/schedule/calendar"
                isActive={pathname === "/schedule/calendar"}
                icon={<Calendar className="h-4 w-4" />}
              >
                Calendar
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/schedule/timesheets"
                isActive={pathname === "/schedule/timesheets"}
                icon={<Clock className="h-4 w-4" />}
              >
                Timesheets
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Company</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/company/employees"
                isActive={pathname === "/company/employees"}
                icon={<Users className="h-4 w-4" />}
              >
                Employees
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/company/locations"
                isActive={pathname === "/company/locations"}
                icon={<Building2 className="h-4 w-4" />}
              >
                Locations
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                as={Link}
                to="/company/documents"
                isActive={pathname === "/company/documents"}
                icon={<FileText className="h-4 w-4" />}
              >
                Documents
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarMenuItem>
          <SidebarMenuButton
            as={Link}
            to="/reports"
            isActive={pathname === "/reports"}
            icon={<Activity className="h-4 w-4" />}
          >
            Reports
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            as={Link}
            to="/table-example"
            isActive={pathname === "/table-example"}
            icon={<Briefcase className="h-4 w-4" />}
          >
            Table Example
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <SidebarGroup position="bottom">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              as={Link}
              to="/settings"
              isActive={pathname === "/settings"}
              icon={<Settings className="h-4 w-4" />}
            >
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
}
