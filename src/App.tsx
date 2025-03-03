
import React from 'react';
import {
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import SelectCompanyPage from "./pages/SelectCompany";
import EmployeesPage from "./pages/employees";
import EmployeeDetailsPage from "./pages/employees/components/EmployeeDetails";
import EmployeeInvitePage from "./pages/employees/components/EmployeeInvite";
import LocationsPage from './pages/settings/locations';
import ConfigPage from './pages/settings/config';
import RotaPage from './pages/rota';
import PlaidPage from './pages/plaid';
import DocumentsPage from './pages/documents';
import PermissionsPage from './pages/settings/permissions';
import TeamPage from './pages/team';
import DocumentSigningPage from './pages/document-signing';
import SentDocumentsPage from './pages/document-signing/components/SentContractsList';
import ShiftsPage from './pages/rota/shifts';
import ShiftTemplatesPage from './pages/rota/shift-templates';
import ShiftTemplatesMasterPage from './pages/rota/shift-templates-master';
import TransactionsPage from './pages/financials/transactions';
import GoCardlessPage from './pages/financials/transactions-gocardless';

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <SidebarProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-company" element={<SelectCompanyPage />} />
            
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
              <Route path="/employees/invite" element={<EmployeeInvitePage />} />
              <Route path="/settings/locations" element={<LocationsPage />} />
              <Route path="/settings/permissions" element={<PermissionsPage />} />
              <Route path="/settings/config" element={<ConfigPage />} />
              <Route path="/rota" element={<RotaPage />} />
              <Route path="/rota/shifts" element={<ShiftsPage />} />
              <Route path="/rota/shift-templates" element={<ShiftTemplatesPage />} />
              <Route path="/rota/shift-templates-master" element={<ShiftTemplatesMasterPage />} />
              <Route path="/plaid" element={<PlaidPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/document-signing" element={<DocumentSigningPage />} />
              <Route path="/document-signing/sent" element={<SentDocumentsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/financials/transactions" element={<TransactionsPage />} />
              <Route path="/financials/transactions-gocardless" element={<GoCardlessPage />} />
            </Route>
          </Routes>
        </SidebarProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
