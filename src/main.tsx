
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { CompanyProvider } from "./contexts/CompanyContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./components/ui/sidebar";

// Get the Clerk publishable key from environment variable
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Instead of throwing an error, just log a warning
if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ""}>
      <AuthProvider>
        <CompanyProvider>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </CompanyProvider>
      </AuthProvider>
    </ClerkProvider>
  </React.StrictMode>
);
