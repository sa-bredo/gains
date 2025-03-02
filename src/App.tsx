import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ThemeProvider } from "next-themes";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import LoginPage from "@/pages/Login";
import SelectCompany from "@/pages/SelectCompany";
import NotFound from "@/pages/NotFound";
import ShiftTemplatesPage from "@/pages/rota/shift-templates";
import ShiftTemplatesMasterPage from "@/pages/rota/shift-templates-master";
import ShiftsPage from "@/pages/rota/shifts";
import LocationsPage from "@/pages/settings/locations";
import ConfigPage from "@/pages/settings/config";
import TeamPage from "@/pages/team";
import DocumentSigningPage from "@/pages/document-signing";
import TransactionsPage from "@/pages/financials/transactions";
import TransactionsGcPage from "@/pages/financials/transactions-gocardless";
import EmployeesPage from "@/pages/employees";

// Import styles
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <CompanyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <SignedOut>
                    <LoginPage />
                  </SignedOut>
                } 
              />
              <Route 
                path="/select-company" 
                element={
                  <SignedIn>
                    <SelectCompany />
                  </SignedIn>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/rota/shift-templates" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <ShiftTemplatesPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/rota/shift-templates-master" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <ShiftTemplatesMasterPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/rota/shifts" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <ShiftsPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/settings/locations" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <LocationsPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/settings/config" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <ConfigPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/team" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/document-signing" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <DocumentSigningPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/financials/transactions" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <TransactionsPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/financials/transactions-gocardless" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <TransactionsGcPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route 
                path="/employees" 
                element={
                  <SignedIn>
                    <ProtectedRoute>
                      <EmployeesPage />
                    </ProtectedRoute>
                  </SignedIn>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </CompanyProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
