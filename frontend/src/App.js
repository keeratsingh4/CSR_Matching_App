import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from "./components/Navbar";
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from "./pages/AdminDashboard";
import HistoryPage from "./pages/HistoryPage";
import VolunteerDashboard from './pages/VolunteerDashboard';
import TaskCompletionPage from './pages/TaskCompletionPage';
import VolunteerHistoryPage from './pages/VolunteerHistoryPage';
import CSRDashboard from './pages/CSRDashboard';

// ✅ New CSR Pages
import CsrVerifyHoursPage from './pages/CsrVerifyHoursPage';
import CsrReportsPage from './pages/CsrReportsPage';

// ────────────────────────────────
// PrivateRoute wrapper
// ────────────────────────────────
function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ────────────────────────────────
// Layout wrapper
// ────────────────────────────────
function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div>
      {user && <Navbar />}
      <div style={{ paddingTop: user ? "4rem" : "0" }}>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────
// Main App
// ────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Shared Dashboard */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute allowedRoles={["PIN", "CSR_REP", "ADMIN", "CORPORATE_VOLUNTEER"]}>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* PIN User */}
            <Route
              path="/history"
              element={
                <PrivateRoute allowedRoles={["PIN"]}>
                  <HistoryPage />
                </PrivateRoute>
              }
            />

            {/* CSR Representative */}
            <Route
              path="/csr-dashboard"
              element={
                <PrivateRoute allowedRoles={["CSR_REP"]}>
                  <CSRDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/csr-verify"
              element={
                <PrivateRoute allowedRoles={["CSR_REP"]}>
                  <CsrVerifyHoursPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/csr-reports"
              element={
                <PrivateRoute allowedRoles={["CSR_REP"]}>
                  <CsrReportsPage />
                </PrivateRoute>
              }
            />

            {/* Corporate Volunteer */}
            <Route
              path="/volunteer-dashboard"
              element={
                <PrivateRoute allowedRoles={["CORPORATE_VOLUNTEER"]}>
                  <VolunteerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks/:taskId/complete"
              element={
                <PrivateRoute allowedRoles={["CORPORATE_VOLUNTEER"]}>
                  <TaskCompletionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer-history"
              element={
                <PrivateRoute allowedRoles={["CORPORATE_VOLUNTEER"]}>
                  <VolunteerHistoryPage />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
