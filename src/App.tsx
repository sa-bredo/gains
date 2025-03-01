
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
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

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/table-example" element={<TableExample />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/financials/transactions" element={<TransactionsPage />} />
          <Route path="/financials/transactions-gocardless" element={<TransactionsGoCardlessPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
