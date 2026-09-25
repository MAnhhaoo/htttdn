import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductManagement from './pages/products/ProductManagement';
import OrderManagement from './pages/orders/OrderManagement';
import StoreSettings from './pages/settings/StoreSettings';
import VoucherManagement from './pages/vouchers/VoucherManagement';
import ReviewManagement from './pages/reviews/ReviewManagement';
import Analytics from './pages/analytics/Analytics';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="/vouchers" element={<VoucherManagement />} />
          <Route path="/reviews" element={<ReviewManagement />} />
          <Route path="/settings" element={<StoreSettings />} />
        </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
