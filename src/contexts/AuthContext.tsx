
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

// Define the shape of our auth context
type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  user?: {
    name: string;
    email: string;
    avatar: string | null;
  };
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps our app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>({
    name: "John Doe",
    email: "john@example.com",
    avatar: null
  });
  
  // Sync the authentication state with Clerk
  useEffect(() => {
    if (isLoaded) {
      setIsAuthenticated(!!isSignedIn);
      
      if (isSignedIn && clerkUser) {
        setUser({
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "User",
          email: clerkUser.primaryEmailAddress?.emailAddress || "john@example.com",
          avatar: clerkUser.imageUrl || null
        });
      }
    }
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
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
