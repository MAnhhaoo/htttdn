import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@shared/components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RealtimeBridge from './realtime/RealtimeBridge';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { OrdersPage } from './pages/orders/OrdersPage';
import { LoginPage } from './pages/auth/LoginPage';
import { MyProfilePage } from './pages/profile/MyProfilePage';
import { InternalShippingPage } from './pages/shipping/InternalShippingPage';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isShippingUser =
    user?.department?.includes('Vận chuyển') || user?.department?.includes('Giao nhận');
  const defaultRoute = isShippingUser ? '/shipping' : '/orders';

  return (
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
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <RealtimeBridge />
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
