import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastProvider, ErrorBoundary } from '@shared/components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import RealtimeBridge from './realtime/RealtimeBridge';
import DashboardLayout from './components/layout/DashboardLayout';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const OrderFulfillmentPage = lazy(() => import('./pages/orders/OrderFulfillmentPage'));
const ProductManagement = lazy(() => import('./pages/products/ProductManagement'));
const VoucherManagement = lazy(() => import('./pages/vouchers/VoucherManagement'));
const SurveyManagement = lazy(() => import('./pages/surveys/SurveyManagement'));
const StoreSettings = lazy(() => import('./pages/settings/StoreSettings'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

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
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/orders" element={<OrderFulfillmentPage />} />
                    <Route path="/products" element={<ProductManagement />} />
                    <Route path="/vouchers" element={<VoucherManagement />} />
                    <Route path="/surveys" element={<SurveyManagement />} />
                    <Route path="/settings" element={<StoreSettings />} />

                    {/* Điều hướng tương thích cho các đường dẫn cũ */}
                    <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/fulfillment" element={<Navigate to="/orders" replace />} />
                    <Route path="/reviews" element={<Navigate to="/products?tab=reviews" replace />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
