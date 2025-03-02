
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { Toaster } from "sonner";

// Import pages
import { Index } from "./pages/Index";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SelectCompany from "./pages/SelectCompany";
import TableExample from "./pages/TableExample";
import DocumentSigningPage from "./pages/document-signing";
import EmployeesPage from "./pages/employees";
import TeamPage from "./pages/team";
import TransactionsPage from "./pages/financials/transactions";
import GoCardlessTransactionsPage from "./pages/financials/transactions-gocardless";
import ConfigPage from "./pages/settings/config";
import LocationsPage from "./pages/settings/locations";
import ShiftsPage from "./pages/rota/shifts";
import ShiftTemplatesPage from "./pages/rota/shift-templates";
import ShiftTemplatesMasterPage from "./pages/rota/shift-templates-master";

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/select-company" element={<SelectCompany />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/table-example" element={
            <ProtectedRoute>
              <TableExample />
            </ProtectedRoute>
          } />
          
          <Route path="/document-signing/*" element={
            <ProtectedRoute>
              <DocumentSigningPage />
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/team" element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } />
          
          <Route path="/financials/transactions" element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/financials/transactions-gocardless" element={
            <ProtectedRoute>
              <GoCardlessTransactionsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings/config" element={
            <ProtectedRoute>
              <ConfigPage />
            </ProtectedRoute>
          } />
          
          <Route path="/settings/locations" element={
            <ProtectedRoute>
              <LocationsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rota/shifts" element={
            <ProtectedRoute>
              <ShiftsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rota/shift-templates" element={
            <ProtectedRoute>
              <ShiftTemplatesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rota/shift-templates-master" element={
            <ProtectedRoute>
              <ShiftTemplatesMasterPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CompanyProvider>
    </AuthProvider>
  );
}
