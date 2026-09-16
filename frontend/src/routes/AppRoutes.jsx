import { Routes, Route, Navigate } from 'react-router-dom';
import UserLayout from '../layouts/UserLayout';
import AccountLayout from '../layouts/AccountLayout';
import Home from '../pages/Home/Home';
import Cart from '../pages/Cart/Cart';
import Checkout from '../pages/Cart/Checkout';
import ProductSearch from '../pages/Product/ProductSearch';
import ProductDetail from '../pages/Product/ProductDetail';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Profile from '../pages/Account/Profile';
import Orders from '../pages/Account/Orders';
import Wishlist from '../pages/Account/Wishlist';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductSearch />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Account Routes */}
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wishlist" element={<Wishlist />} />
        </Route>
      </Route>
    </Routes>
  );
}
