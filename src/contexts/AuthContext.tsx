
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Login function - in a real app, this would validate credentials against a backend
  const login = async (email: string, password: string) => {
    // This is a mock implementation - in a real app, you'd make an API call
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
    } else {
      throw new Error("Invalid credentials");
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
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
