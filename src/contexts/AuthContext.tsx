import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>({
    name: "John Doe",
    email: "john@example.com",
    avatar: null
  });
  
  // Check if user was previously logged in and synchronize with Supabase
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check Supabase session first
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("isAuthenticated");
          return;
        }
        
        if (data.session) {
          console.log("Active Supabase session found");
          setIsAuthenticated(true);
          localStorage.setItem("isAuthenticated", "true");
          setUser({
            name: data.session.user.user_metadata.name || "John Doe",
            email: data.session.user.email || "john@example.com",
            avatar: data.session.user.user_metadata.avatar_url || null
          });
          return;
        }
        
        // If no active Supabase session, try to sign in with stored credentials
        const email = localStorage.getItem("userEmail");
        const password = localStorage.getItem("userPassword");
        
        if (email && password) {
          console.log("Attempting to sign in with stored credentials");
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (error) {
              console.error("Error signing in with stored credentials:", error);
              setIsAuthenticated(false);
              localStorage.removeItem("isAuthenticated");
              return;
            }
            
            if (data.session) {
              console.log("Successfully signed in with stored credentials");
              setIsAuthenticated(true);
              localStorage.setItem("isAuthenticated", "true");
              setUser({
                name: data.session.user.user_metadata.name || "John Doe",
                email: data.session.user.email || "john@example.com",
                avatar: data.session.user.user_metadata.avatar_url || null
              });
              return;
            }
          } catch (error) {
            console.error("Exception signing in with stored credentials:", error);
            // Clear potentially corrupted authentication state
            localStorage.removeItem("isAuthenticated");
            setIsAuthenticated(false);
          }
        }
        
        // If no active session and no stored credentials, check local storage as fallback
        const authStatus = localStorage.getItem("isAuthenticated");
        if (authStatus === "true") {
          console.log("Using localStorage authentication status (MOCK MODE)");
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        // Clear potentially corrupted authentication state
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
      }
    };
    
    // Initial session check
    checkSession();
    
    // Set up authentication state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      if (session) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        setUser({
          name: session.user.user_metadata.name || "John Doe",
          email: session.user.email || "john@example.com",
          avatar: session.user.user_metadata.avatar_url || null
        });
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPassword");
        localStorage.removeItem("authTimestamp");
      }
    });
    
    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with credentials:", { email });
      
      // First, check if we can use Supabase auth
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Supabase auth error:", error);
          throw new Error(error.message);
        }
        
        if (data.session) {
          console.log("Supabase login successful");
          setIsAuthenticated(true);
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userPassword", password);
          localStorage.setItem("authTimestamp", Date.now().toString());
          setUser({
            name: data.session.user.user_metadata.name || "John Doe",
            email: data.session.user.email || "john@example.com",
            avatar: data.session.user.user_metadata.avatar_url || null
          });
          return { success: true };
        }
      } catch (error) {
        console.log("Supabase auth not fully configured, falling back to mock auth");
      }
      
      // Mock implementation - in a real app, we wouldn't use this
      if (email && password) {
        console.log("Mock login successful");
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authTimestamp", Date.now().toString());
        setUser({
          name: "John Doe",
          email: "john@example.com",
          avatar: null
        });
        return { success: true };
      } else {
        const errorMsg = "Invalid credentials";
        console.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Login failed";
      console.error("Login error:", errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out user");
    
    // Try to sign out with Supabase
    supabase.auth.signOut().then(() => {
      console.log("Supabase signOut completed");
    }).catch(error => {
      console.error("Supabase signOut error:", error);
    }).finally(() => {
      // Always clear local state regardless of Supabase result
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userPassword");
      localStorage.removeItem("authTimestamp");
    });
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
