
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarSection, SidebarItem } from "@/components/ui/sidebar";

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
      <SidebarSection>
        <SidebarItem
          as={Link}
          to="/"
          active={pathname === "/"}
          icon={<LayoutDashboard className="h-4 w-4" />}
        >
          Dashboard
        </SidebarItem>
        <SidebarItem
          as={Link}
          to="/explore"
          active={pathname === "/explore"}
          icon={<Compass className="h-4 w-4" />}
        >
          Explore
        </SidebarItem>
        
        <SidebarSection
          title="Financials"
          showDivider
          collapsible
          defaultOpen={pathname.includes('/financials')}
        >
          <SidebarItem
            as={Link}
            to="/financials/transactions"
            active={pathname === "/financials/transactions"}
            icon={<CreditCard className="h-4 w-4" />}
          >
            Transactions
          </SidebarItem>
          <SidebarItem
            as={Link}
            to="/financials/transactions-tink"
            active={pathname === "/financials/transactions-tink"}
            icon={<BanknoteIcon className="h-4 w-4" />}
          >
            Transactions via Tink
          </SidebarItem>
        </SidebarSection>
        
        <SidebarSection
          title="Schedule"
          showDivider
          collapsible
          defaultOpen={pathname.includes('/schedule')}
        >
          <SidebarItem
            as={Link}
            to="/schedule/calendar"
            active={pathname === "/schedule/calendar"}
            icon={<Calendar className="h-4 w-4" />}
          >
            Calendar
          </SidebarItem>
          <SidebarItem
            as={Link}
            to="/schedule/timesheets"
            active={pathname === "/schedule/timesheets"}
            icon={<Clock className="h-4 w-4" />}
          >
            Timesheets
          </SidebarItem>
        </SidebarSection>

        <SidebarSection
          title="Company"
          showDivider
          collapsible
          defaultOpen={pathname.includes('/company')}
        >
          <SidebarItem
            as={Link}
            to="/company/employees"
            active={pathname === "/company/employees"}
            icon={<Users className="h-4 w-4" />}
          >
            Employees
          </SidebarItem>
          <SidebarItem
            as={Link}
            to="/company/locations"
            active={pathname === "/company/locations"}
            icon={<Building2 className="h-4 w-4" />}
          >
            Locations
          </SidebarItem>
          <SidebarItem
            as={Link}
            to="/company/documents"
            active={pathname === "/company/documents"}
            icon={<FileText className="h-4 w-4" />}
          >
            Documents
          </SidebarItem>
        </SidebarSection>

        <SidebarItem
          as={Link}
          to="/reports"
          active={pathname === "/reports"}
          icon={<Activity className="h-4 w-4" />}
        >
          Reports
        </SidebarItem>
        <SidebarItem
          as={Link}
          to="/table-example"
          active={pathname === "/table-example"}
          icon={<Briefcase className="h-4 w-4" />}
        >
          Table Example
        </SidebarItem>
      </SidebarSection>

      <SidebarSection position="bottom">
        <SidebarItem
          as={Link}
          to="/settings"
          active={pathname === "/settings"}
          icon={<Settings className="h-4 w-4" />}
        >
          Settings
        </SidebarItem>
      </SidebarSection>
    </Sidebar>
  );
}
