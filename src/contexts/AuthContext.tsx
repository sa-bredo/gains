
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";

// Define the available user roles
export type UserRole = 'admin' | 'manager' | 'front_of_house' | 'founder' | 'instructor';

// Define the shape of our auth context
type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  user?: {
    name: string;
    email: string;
    avatar: string | null;
    role?: UserRole;
  };
  userRole: UserRole | null;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps our app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch the user's role from your database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('role')
        .eq('auth_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      // Validate that the role is one of our defined roles
      const role = data?.role as UserRole;
      if (role && ['admin', 'manager', 'front_of_house', 'founder', 'instructor'].includes(role)) {
        return role;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };
  
  // Sync the authentication state with Clerk
  useEffect(() => {
    const syncAuthState = async () => {
      setIsLoading(true);
      
      if (isLoaded) {
        setIsAuthenticated(!!isSignedIn);
        
        if (isSignedIn && clerkUser) {
          const userInfo = {
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "User",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            avatar: clerkUser.imageUrl || null
          };
          
          setUser(userInfo);
          
          // Fetch the user's role
          const role = await fetchUserRole(clerkUser.id);
          setUserRole(role);
        } else {
          setUserRole(null);
        }
      }
      
      setIsLoading(false);
    };
    
    syncAuthState();
  }, [isLoaded, isSignedIn, clerkUser]);

  // Login function - this is just a wrapper around Clerk's sign-in
  // This is kept for backward compatibility with code that might use it
  const login = async (email: string, password: string) => {
    console.log("Login function called - using Clerk for authentication");
    return { success: true };
  };

  // Logout function - this is just a wrapper around Clerk's sign-out
  // This is kept for backward compatibility with code that might use it
  const logout = () => {
    console.log("Logout function called - using Clerk for authentication");
  };

  // Check if the user has a specific role or one of several roles
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!userRole) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userRole);
    }
    
    return roles === userRole;
  };

  const contextValue = {
    isAuthenticated,
    login,
    logout,
    user,
    userRole,
    hasRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
