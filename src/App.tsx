
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUpPage from "@/pages/SignUp";
import VerifyEmailPage from "@/pages/VerifyEmail";
import SelectCompany from "@/pages/SelectCompany";
import PlaidPage from "./pages/plaid"; // Fixed: Direct relative path to avoid case sensitivity issues
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
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/select-company" element={<SelectCompany />} />
            <Route path="/plaid" element={<PlaidPage />} />
            <Route path="/rota" element={<RotaPage />} />
            <Route path="/rota/shifts" element={<ShiftsPage />} />
          </Route>
        
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
