import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider, ErrorBoundary } from './components/ui';
import RealtimeBridge from './realtime/RealtimeBridge';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

const AnalyticsWorkspace = lazy(() => import('./pages/analytics/AnalyticsWorkspace'));
const VendorWorkspace = lazy(() => import('./pages/vendors/VendorWorkspace'));
const OrderWorkspace = lazy(() => import('./pages/orders/OrderWorkspace'));
const CatalogWorkspace = lazy(() => import('./pages/categories/CatalogWorkspace'));
const EmployeeWorkspace = lazy(() => import('./pages/employees/EmployeeWorkspace'));
const UserManagement = lazy(() => import('./pages/users/UserManagement'));
const SurveyWorkspace = lazy(() => import('./pages/surveys/SurveyWorkspace'));
const Login = lazy(() => import('./pages/auth/Login'));

function RouteLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <RealtimeBridge />
            <ErrorBoundary>
              <Suspense fallback={<RouteLoader />}>
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
              </Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
