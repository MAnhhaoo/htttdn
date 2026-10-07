import { Routes, Route } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import Home from '../pages/Home/Home';
import ProductSearch from '../pages/Product/ProductSearch';
import ProductDetail from '../pages/Product/ProductDetail';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Profile from '../pages/Account/Profile';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Cart/Checkout';
import Orders from '../pages/Account/Orders';
import About from '../pages/About/About';
import Contact from '../pages/Contact/Contact';
import PaymentDemo from '../pages/Cart/PaymentDemo';
import Favorites from '../pages/Account/Favorites';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductSearch />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-demo/:orderId" element={<PaymentDemo />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Route>
    </Routes>
  );
}
