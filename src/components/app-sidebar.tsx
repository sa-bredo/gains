"use client"

import * as React from "react"
import { Link } from "react-router-dom";
import {
  Heart,
  Brain,
  BookOpen,
  Layers,
  Users,
  Settings,
  Activity,
  Search,
  Lightbulb,
  ChevronRight,
  Calendar,
  DollarSign,
  BarChart,
  Briefcase,
  ListCheck
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronsUpDown, LogOut, BadgeCheck } from "lucide-react"

const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://randomuser.me/api/portraits/men/21.jpg",
};

const navMain = [
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Heart className="h-5 w-5 text-primary" />
                <span>Studio Anatomy</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function useSidebar() {
  const isMobile = window.innerWidth < 768;
  return { isMobile };
}
