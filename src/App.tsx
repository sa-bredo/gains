
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import About from "@/pages/About";
import Explore from "@/pages/Explore";
import Login from "@/pages/Login";
import TableExample from "@/pages/TableExample";
import FinancialsTransactions from "@/pages/financials/transactions";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/index" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/table-example" element={<TableExample />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/financials/transactions" element={<FinancialsTransactions />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
