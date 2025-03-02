
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import TableExample from "./pages/TableExample";
import DocumentSigning from "./pages/document-signing";
import TeamPage from "./pages/team";
import FinancialsTransactions from "./pages/financials/transactions";
import FinancialsTransactionsGoCardless from "./pages/financials/transactions-gocardless";
import LocationsPage from "./pages/settings/locations";
import ShiftTemplatesPage from "./pages/rota/shift-templates";
import ShiftTemplatesMasterPage from "./pages/rota/shift-templates-master";
import ShiftsPage from "./pages/rota/shifts";

import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explore"
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table-example"
                element={
                  <ProtectedRoute>
                    <TableExample />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/document-signing/*"
                element={
                  <ProtectedRoute>
                    <DocumentSigning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <TeamPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financials/transactions"
                element={
                  <ProtectedRoute>
                    <FinancialsTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financials/transactions-gocardless"
                element={
                  <ProtectedRoute>
                    <FinancialsTransactionsGoCardless />
                  </ProtectedRoute>
                }
              />
              {/* Routes for locations and templates */}
              <Route
                path="/settings/locations"
                element={
                  <ProtectedRoute>
                    <LocationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rota/shift-templates"
                element={
                  <ProtectedRoute>
                    <ShiftTemplatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rota/shift-templates-master"
                element={
                  <ProtectedRoute>
                    <ShiftTemplatesMasterPage />
                  </ProtectedRoute>
                }
              />
              {/* Add the new route for shifts */}
              <Route
                path="/rota/shifts"
                element={
                  <ProtectedRoute>
                    <ShiftsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
