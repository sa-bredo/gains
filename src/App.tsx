import React from "react";
import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUpPage from "@/pages/SignUp";
import VerifyEmailPage from "@/pages/VerifyEmail";
import SelectCompany from "@/pages/SelectCompany";
import Dashboard from "@/pages/Dashboard";
import PlaidPage from "./pages/plaid"; 
import RotaPage from "@/pages/rota";
import ShiftsPage from "@/pages/rota/shifts";
import ShiftTemplatesPage from "@/pages/rota/shift-templates";
import ShiftTemplatesMasterPage from "@/pages/rota/shift-templates-master";
import DocumentSigningPage from "@/pages/document-signing";
import EmployeesPage from "@/pages/employees";
import TeamPage from './pages/team';
import ConfigPage from './pages/settings/config';
import LocationsPage from './pages/settings/locations';
import PermissionsPage from './pages/settings/permissions';
import SlackSettingsPage from './pages/settings/integrations/slack';
import AboutPage from "@/pages/About";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import FormsPage from "./pages/forms";
import NewFormPage from "./pages/forms/new";
import EditFormPage from "./pages/forms/edit";
import FormSubmissionsPage from "./pages/forms/submissions";
import PublicFormPage from "./pages/form/[publicUrl]";
import FormExample from "@/pages/form-example";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/form/:publicUrl" element={<PublicFormPage />} />
        <Route path="/form-example" element={<FormExample />} />
      
        <Route element={<ProtectedRoute />}>
          <Route path="/select-company" element={<SelectCompany />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plaid" element={<PlaidPage />} />
          <Route path="/rota" element={<RotaPage />} />
          <Route path="/rota/shifts" element={<ShiftsPage />} />
          <Route path="/rota/shift-templates" element={<ShiftTemplatesPage />} />
          <Route path="/rota/shift-templates-master" element={<ShiftTemplatesMasterPage />} />
          <Route path="/document-signing/*" element={<DocumentSigningPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings/config" element={<ConfigPage />} />
          <Route path="/settings/locations" element={<LocationsPage />} />
          <Route path="/settings/permissions" element={<PermissionsPage />} />
          <Route path="/settings/integrations/slack" element={<SlackSettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/knowledge" element={<NotFound />} />
          <Route path="/forms" element={<FormsPage />} />
          <Route path="/forms/new" element={<NewFormPage />} />
          <Route path="/forms/edit/:id" element={<EditFormPage />} />
          <Route path="/forms/:id/submissions" element={<FormSubmissionsPage />} />
        </Route>
      
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
