import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui';
import RealtimeBridge from './realtime/RealtimeBridge';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AnalyticsWorkspace from './pages/analytics/AnalyticsWorkspace';
import VendorWorkspace from './pages/vendors/VendorWorkspace';
import OrderWorkspace from './pages/orders/OrderWorkspace';
import CatalogWorkspace from './pages/categories/CatalogWorkspace';
import EmployeeWorkspace from './pages/employees/EmployeeWorkspace';
import UserManagement from './pages/users/UserManagement';
import SurveyWorkspace from './pages/surveys/SurveyWorkspace';
import Login from './pages/auth/Login';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <RealtimeBridge />
            <Routes>
              <Route path="/" element={<Navigate to="/analytics" replace />} />
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* 7 Consolidated Admin Workspaces */}
                  <Route path="/analytics" element={<AnalyticsWorkspace />} />
                  <Route path="/vendors" element={<VendorWorkspace />} />
                  <Route path="/orders" element={<OrderWorkspace />} />
                  <Route path="/catalog" element={<CatalogWorkspace />} />
                  <Route path="/employees" element={<EmployeeWorkspace />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/surveys" element={<SurveyWorkspace />} />

                  {/* Legacy Route Redirects (100% backward-compatible) */}
                  <Route path="/dashboard" element={<Navigate to="/analytics" replace />} />
                  <Route
                    path="/customer-analytics"
                    element={<Navigate to="/analytics?tab=customers" replace />}
                  />
                  <Route
                    path="/vendor-registrations"
                    element={<Navigate to="/vendors?tab=registrations" replace />}
                  />
                  <Route
                    path="/shipping"
                    element={<Navigate to="/orders?tab=shipping" replace />}
                  />
                  <Route
                    path="/categories"
                    element={<Navigate to="/catalog?tab=categories" replace />}
                  />
                  <Route
                    path="/vouchers"
                    element={<Navigate to="/catalog?tab=vouchers" replace />}
                  />
                  <Route
                    path="/payroll"
                    element={<Navigate to="/employees?tab=payroll" replace />}
                  />
                  <Route
                    path="/reviews"
                    element={<Navigate to="/surveys?tab=reviews" replace />}
                  />
                  <Route path="*" element={<Navigate to="/analytics" replace />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
