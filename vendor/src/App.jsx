import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@shared/components/ui';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import RealtimeBridge from './realtime/RealtimeBridge';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import OrderFulfillmentPage from './pages/orders/OrderFulfillmentPage';
import ProductManagement from './pages/products/ProductManagement';
import VoucherManagement from './pages/vouchers/VoucherManagement';
import SurveyManagement from './pages/surveys/SurveyManagement';
import StoreSettings from './pages/settings/StoreSettings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <RealtimeBridge />
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
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
