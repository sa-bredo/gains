
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronsUpDown, LogOut, UserCircle } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { UserProfile as UserProfileType } from "./types";

interface UserProfileMenuProps {
  user: UserProfileType;
  isMobile: boolean;
}

const UserProfileMenu: FC<UserProfileMenuProps> = ({ user, isMobile }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useClerk();
  
  // Create initials from name for avatar fallback
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
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
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

// Default user profile for guest users
const defaultUserProfile: UserProfileType = {
  name: "Guest User",
  email: "guest@example.com",
  avatar: "",
};

// Export the component and use default user if none provided
export function UserProfile() {
  const { user } = useUser();
  const isMobile = false; // We could use a hook here but keeping it simple
  
  const userProfileData: UserProfileType = user ? {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "User",
    email: user.primaryEmailAddress?.emailAddress || "",
    avatar: user.imageUrl || "",
  } : defaultUserProfile;
  
  return <UserProfileMenu user={userProfileData} isMobile={isMobile} />;
}
