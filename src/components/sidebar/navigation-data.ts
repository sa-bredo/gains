import {
  LayoutDashboard,
  Users,
  Calendar,
  MapPin,
  Settings,
  Lock,
  Building2,
  FileText,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  icon: any;
  href: string;
  disabled?: boolean;
  permission?: string; // Add permission property
  permissionAction?: string; // Add permissionAction property
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const getNavigationItems = (): NavigationItem[] => {
  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Employees",
      icon: Users,
      href: "/employees",
      permission: "employees", // permission required to view this link
      permissionAction: "view", // what permission action is required
    },
    {
      title: "Rota",
      icon: Calendar,
      href: "/rota/shifts",
      permission: "shifts", // permission required to view this link
      permissionAction: "view", // what permission action is required
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/documents",
      permission: "documents", // permission required to view this link
      permissionAction: "view", // what permission action is required
    },
  ];
};

// Update the settings groups to include the permissions page
export const getNavigationGroups = (): NavigationGroup[] => {
  return [
    {
      title: "Main",
      items: getNavigationItems(),
    },
    {
      title: "Company",
      items: [
        {
          title: "Select Company",
          icon: Building2,
          href: "/select-company",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Locations",
          icon: MapPin,
          href: "/settings/locations",
          permission: "locations", // permission required to view this link
          permissionAction: "view", // what permission action is required
        },
        {
          title: "Permissions",
          icon: Lock,
          href: "/settings/permissions",
          permission: "config", // only users with config access can manage permissions
          permissionAction: "view", 
        },
        {
          title: "Config",
          icon: Settings,
          href: "/settings/config",
          permission: "config",
          permissionAction: "view",
        },
      ],
    },
  ];
};

export const getNavigationItemsWithPermissions = (
  userPermissions: any
): NavigationItem[] => {
  let navigationItems = getNavigationItems();

  // Filter navigation items based on user permissions
  navigationItems = navigationItems.filter((item) => {
    if (item.permission && item.permissionAction) {
      return userPermissions.canView(item.permission);
    }
    return true;
  });

  return navigationItems;
};
