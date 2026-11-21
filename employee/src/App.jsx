import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastProvider, ErrorBoundary } from '@shared/components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RealtimeBridge from './realtime/RealtimeBridge';

import { DashboardLayout } from './components/layout/DashboardLayout';

const OrdersPage = lazy(() =>
  import('./pages/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })),
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const MyProfilePage = lazy(() =>
  import('./pages/profile/MyProfilePage').then((m) => ({ default: m.MyProfilePage })),
);
const InternalShippingPage = lazy(() =>
  import('./pages/shipping/InternalShippingPage').then((m) => ({ default: m.InternalShippingPage })),
);

function RouteLoader() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-amber-600" />
    </div>
  );
}

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  const isShippingUser =
    user?.department?.includes('Vận chuyển') || user?.department?.includes('Giao nhận');
  const defaultRoute = isShippingUser ? '/shipping' : '/orders';

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to={defaultRoute} replace />} />
          <Route
            path="/orders"
            element={isShippingUser ? <Navigate to="/shipping" replace /> : <OrdersPage />}
          />
          <Route
            path="/vendor-tracking"
            element={<Navigate to={isShippingUser ? '/shipping' : '/orders?view=sla'} replace />}
          />
          <Route
            path="/audit-history"
            element={<Navigate to={isShippingUser ? '/shipping' : '/orders?view=audit'} replace />}
          />
          <Route path="/permissions-faq" element={<Navigate to="/profile" replace />} />
          <Route
            path="/shipping"
            element={isShippingUser ? <InternalShippingPage /> : <Navigate to="/orders" replace />}
          />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <RealtimeBridge />
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
