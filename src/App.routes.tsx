
// This file is currently not used by the application
// The main routing is handled directly in App.tsx

import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Placeholder for loading component
const Loading = () => <div>Loading...</div>;

// Lazy loaded pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const PlaidPage = lazy(() => import("@/pages/plaid"));
const TransactionsPage = lazy(() => import("@/pages/financials/transactions"));
const TransactionsGoCardlessPage = lazy(() => import("@/pages/financials/transactions-gocardless"));
const EmployeesPage = lazy(() => import("@/pages/employees"));
const DocumentSigningPage = lazy(() => import("@/pages/document-signing"));
const FormsPage = lazy(() => import("@/pages/forms"));
const RotaShiftsPage = lazy(() => import("@/pages/rota/shifts"));
const RotaShiftTemplatesMasterPage = lazy(() => import("@/pages/rota/shift-templates-master"));
const TeamPage = lazy(() => import("@/pages/team"));
const ConfigPage = lazy(() => import("@/pages/settings/config"));
const LocationsPage = lazy(() => import("@/pages/settings/locations"));
const PermissionsPage = lazy(() => import("@/pages/settings/permissions"));
const SlackSettingsPage = lazy(() => import("@/pages/settings/integrations/slack"));

// This routes array is not currently used - app routing is defined in App.tsx
const routes = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
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
      {
        path: "team",
        element: (
          <Suspense fallback={<Loading />}>
            <TeamPage />
          </Suspense>
        ),
      },
      {
        path: "settings/config",
        element: (
          <Suspense fallback={<Loading />}>
            <ConfigPage />
          </Suspense>
        ),
      },
      {
        path: "settings/locations",
        element: (
          <Suspense fallback={<Loading />}>
            <LocationsPage />
          </Suspense>
        ),
      },
      {
        path: "settings/permissions",
        element: (
          <Suspense fallback={<Loading />}>
            <PermissionsPage />
          </Suspense>
        ),
      },
      {
        path: "settings/integrations/slack",
        element: (
          <Suspense fallback={<Loading />}>
            <SlackSettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];

export default routes;
