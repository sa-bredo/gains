
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Explore from './pages/Explore';
import About from './pages/About';
import NotFound from './pages/NotFound';
import TableExample from './pages/TableExample';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/employees';
import TransactionsPage from './pages/financials/transactions';
import TransactionsGoCardlessPage from './pages/financials/transactions-gocardless';
import TeamPage from './pages/team';
import DocumentSigning from './pages/document-signing';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/index" element={<Index />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
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
          <Route path="/employees" element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          } />
          <Route path="/financials/transactions" element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          } />
          <Route path="/financials/transactions-gocardless" element={
            <ProtectedRoute>
              <TransactionsGoCardlessPage />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          } />
          <Route path="/document-signing" element={
            <ProtectedRoute>
              <DocumentSigning />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
