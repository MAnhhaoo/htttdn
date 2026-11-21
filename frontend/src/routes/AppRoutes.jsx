import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@shared/components/ui';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';
import AccountLayout from '../layouts/AccountLayout';
import ProtectedRoute from './ProtectedRoute';
import Loading from '../components/common/Loading/Loading';
import Home from '../pages/Home/Home';

const ProductSearch = lazy(() => import('../pages/Product/ProductSearch'));
const ProductDetail = lazy(() => import('../pages/Product/ProductDetail'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const Profile = lazy(() => import('../pages/Account/Profile'));
const Cart = lazy(() => import('../pages/Cart/Cart'));
const Checkout = lazy(() => import('../pages/Cart/Checkout'));
const Orders = lazy(() => import('../pages/Account/Orders'));
const About = lazy(() => import('../pages/About/About'));
const Contact = lazy(() => import('../pages/Contact/Contact'));
const PaymentDemo = lazy(() => import('../pages/Cart/PaymentDemo'));
const Favorites = lazy(() => import('../pages/Account/Favorites'));
const VendorShop = lazy(() => import('../pages/Shop/VendorShop'));
const SurveyPage = lazy(() => import('../pages/Survey/SurveyPage'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading text="Đang tải trang..." />}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductSearch />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/shop/:id" element={<VendorShop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment-demo/:orderId" element={<PaymentDemo />} />

              <Route element={<AccountLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/surveys" element={<SurveyPage />} />
              </Route>

              <Route path="/surveys/:responseId" element={<SurveyPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
