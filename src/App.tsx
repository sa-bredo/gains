
import React from 'react';
import {
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";
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

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
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
            <Route path="/plaid" element={<PlaidPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Route>
        </Routes>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;
