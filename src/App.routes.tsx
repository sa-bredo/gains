import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AppLayout } from "./layout";
import { ProtectedRoute } from "./components/auth/protected-route";
import { Shell } from "./components/shell";
import { Loading } from "./components/loading";

const HomePage = lazy(() => import("./pages/home"));
const AuthPage = lazy(() => import("./pages/auth"));
const ProfilePage = lazy(() => import("./pages/profile"));
const PlaidPage = lazy(() => import("./pages/plaid"));
const TransactionsPage = lazy(() => import("./pages/financials/transactions"));
const TransactionsGoCardlessPage = lazy(() => import("./pages/financials/transactions-gocardless"));
const EmployeesPage = lazy(() => import("./pages/employees"));
const EmployeesInvitePage = lazy(() => import("./pages/employees/invite"));
const DocumentSigningPage = lazy(() => import("./pages/document-signing"));
const FormsPage = lazy(() => import("./pages/forms"));
const RotaShiftsPage = lazy(() => import("./pages/rota/shifts"));
const RotaShiftTemplatesMasterPage = lazy(() => import("./pages/rota/shift-templates-master"));
import TeamPage from './pages/team';
import ConfigPage from './pages/settings/config';
import LocationsPage from './pages/settings/locations';
import PermissionsPage from './pages/settings/permissions';
import SlackSettingsPage from './pages/settings/integrations/slack';

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "plaid",
        element: (
          <Suspense fallback={<Loading />}>
            <PlaidPage />
          </Suspense>
        ),
      },
      {
        path: "financials/transactions",
        element: (
          <Suspense fallback={<Loading />}>
            <TransactionsPage />
          </Suspense>
        ),
      },
      {
        path: "financials/transactions-gocardless",
        element: (
          <Suspense fallback={<Loading />}>
            <TransactionsGoCardlessPage />
          </Suspense>
        ),
      },
      {
        path: "employees",
        element: (
          <Suspense fallback={<Loading />}>
            <EmployeesPage />
          </Suspense>
        ),
      },
      {
        path: "employees/invite",
        element: (
          <Suspense fallback={<Loading />}>
            <EmployeesInvitePage />
          </Suspense>
        ),
      },
      {
        path: "document-signing",
        element: (
          <Suspense fallback={<Loading />}>
            <DocumentSigningPage />
          </Suspense>
        ),
      },
      {
        path: "forms",
        element: (
          <Suspense fallback={<Loading />}>
            <FormsPage />
          </Suspense>
        ),
      },
      {
        path: "rota/shifts",
        element: (
          <Suspense fallback={<Loading />}>
            <RotaShiftsPage />
          </Suspense>
        ),
      },
      {
        path: "rota/shift-templates-master",
        element: (
          <Suspense fallback={<Loading />}>
            <RotaShiftTemplatesMasterPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "auth",
    element: (
      <Shell>
        <Suspense fallback={<Loading />}>
          <AuthPage />
        </Suspense>
      </Shell>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
  
  // Team route
  {
    path: "team",
    element: <ProtectedRoute><TeamPage /></ProtectedRoute>,
  },
  
  // Settings routes
  {
    path: "settings/config",
    element: <ProtectedRoute><ConfigPage /></ProtectedRoute>,
  },
  {
    path: "settings/locations",
    element: <ProtectedRoute><LocationsPage /></ProtectedRoute>,
  },
  {
    path: "settings/permissions",
    element: <ProtectedRoute><PermissionsPage /></ProtectedRoute>,
  },
  {
    path: "settings/integrations/slack",
    element: <ProtectedRoute><SlackSettingsPage /></ProtectedRoute>,
  },
];

export default routes;
