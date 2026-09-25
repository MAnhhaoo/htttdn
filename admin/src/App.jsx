import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import UserManagement from './pages/users/UserManagement';
import ProductManagement from './pages/products/ProductManagement';
import CategoryManagement from './pages/categories/CategoryManagement';
import OrderManagement from './pages/orders/OrderManagement';
import VoucherManagement from './pages/vouchers/VoucherManagement';
import ReviewManagement from './pages/reviews/ReviewManagement';
import VendorManagement from './pages/vendors/VendorManagement';
import Analytics from './pages/analytics/Analytics';
import Login from './pages/auth/Login';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/vouchers" element={<VoucherManagement />} />
              <Route path="/reviews" element={<ReviewManagement />} />
              <Route path="/vendors" element={<VendorManagement />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
