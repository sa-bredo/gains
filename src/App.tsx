
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
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/select-company" element={<SelectCompany />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plaid" element={<PlaidPage />} />
          <Route path="/rota" element={<RotaPage />} />
          <Route path="/rota/shifts" element={<ShiftsPage />} />
        </Route>
      
        {/* This is crucial - catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
