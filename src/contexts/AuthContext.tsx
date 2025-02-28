
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the shape of our auth context
type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps our app and makes auth available to any child component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user was previously logged in (from localStorage)
  useEffect(() => {
    // Check Supabase session first
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Active Supabase session found");
          setIsAuthenticated(true);
          localStorage.setItem("isAuthenticated", "true");
          return;
        }
        
        // Fallback to localStorage if no active Supabase session
        const authStatus = localStorage.getItem("isAuthenticated");
        if (authStatus === "true") {
          console.log("Using localStorage authentication status");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Clear potentially corrupted authentication state
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
  }, []);

  // Login function - in a real app, this would validate credentials against a backend
  const login = async (email: string, password: string) => {
    try {
      // First, try to sign in with Supabase if available
      try {
        // This is just a mock implementation since we're not actually using Supabase auth directly
        // In a real app, you'd use supabase.auth.signInWithPassword here
        console.log("Attempting login with credentials:", { email });
      } catch (error) {
        console.log("Supabase auth not configured, using mock auth");
      }
      
      // Mock implementation - in a real app, you'd verify these against a backend
      if (email && password) {
        console.log("Login successful");
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        
        // Add a timestamp for session management
        localStorage.setItem("authTimestamp", Date.now().toString());
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user");
    // Try to sign out with Supabase if available
    try {
      supabase.auth.signOut();
    } catch (error) {
      console.log("Supabase auth not configured, using mock logout");
    }
    
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("authTimestamp");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
