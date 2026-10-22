import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RealtimeBridge from './realtime/RealtimeBridge';
import { ordersApi } from './api/axiosClient';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { OrdersPage } from './pages/orders/OrdersPage';
import { VendorTrackingPage } from './pages/orders/VendorTrackingPage';
import { AuditHistoryPage } from './pages/orders/AuditHistoryPage';
import { PermissionsFaqPage } from './pages/orders/PermissionsFaqPage';
import { LoginPage } from './pages/auth/LoginPage';
import { MyProfilePage } from './pages/profile/MyProfilePage';
import { InternalShippingPage } from './pages/shipping/InternalShippingPage';
import { VendorApprovalPage } from './pages/vendors/VendorApprovalPage';

import { OrderDetailModal } from './components/orders/OrderDetailModal';
import { ConfirmOrderModal } from './components/orders/ConfirmOrderModal';
import { RejectOrderModal } from './components/orders/RejectOrderModal';
import { TransferVendorModal } from './components/orders/TransferVendorModal';
import { ExceptionModal } from './components/orders/ExceptionModal';
import { formatOrder } from './utils/orderFormat';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [countsByStatus, setCountsByStatus] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [detailOrder, setDetailOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [transferOrder, setTransferOrder] = useState(null);
  const [exceptionOrder, setExceptionOrder] = useState(null);

  // Fetch real orders from database via backend API
  const fetchRealOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await ordersApi.listAll({ page: 1, itemPerPage: 100 });
      const rawList = res?.list || res?.data?.list || (Array.isArray(res) ? res : []);
      if (Array.isArray(rawList)) {
        const formatted = rawList.map(formatOrder);
        setOrders(formatted);
      }
      if (res?.countsByStatus) {
        setCountsByStatus(res.countsByStatus);
      }
      if (res?.totalItems !== undefined) {
        setTotalItems(res.totalItems);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng thực từ API:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRealOrders();
  }, [fetchRealOrders]);

  useEffect(() => {
    window.addEventListener('miva:orders', fetchRealOrders);
    return () => window.removeEventListener('miva:orders', fetchRealOrders);
  }, [fetchRealOrders]);

  // 1. Confirm Order Action (Real DB Patch)
  const handleConfirmOrder = async (orderId, note) => {
    try {
      await ordersApi.updateStatus(orderId, { status: 'confirmed', note });
      await fetchRealOrders();
    } catch (err) {
      alert(`Lỗi xác nhận đơn: ${err.response?.data?.message || err.message}`);
    }
  };

  // 2. Reject Unconfirmed Order Action (Real DB Patch)
  const handleRejectOrder = async (orderId, note, ruleCode) => {
    try {
      await ordersApi.updateStatus(orderId, { status: 'cancelled', note });
      await fetchRealOrders();
    } catch (err) {
      alert(`Lỗi từ chối đơn: ${err.response?.data?.message || err.message}`);
    }
  };

  // 3. Transfer Order to Vendor (Real DB Patch: confirmed -> processing)
  const handleTransferVendor = async (orderId, vendor, slaHours, note) => {
    try {
      const fullNote = `[Chuyển Vendor: ${vendor.name} (${vendor.code})] SLA: ${slaHours}h. Ghi chú: ${note}`;
      await ordersApi.updateStatus(orderId, { status: 'processing', note: fullNote });
      await fetchRealOrders();
    } catch (err) {
      alert(`Lỗi chuyển đơn cho Vendor: ${err.response?.data?.message || err.message}`);
    }
  };

  // 4. Resolve Exception within Scope (Real DB Audit Note & Notify Vendor)
  const handleResolveException = async (orderId, resolveData) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const note = `[Xử lý sự cố trong thẩm quyền] Loại: ${resolveData.type}. Kết quả: ${resolveData.note}`;
      await ordersApi.updateStatus(orderId, {
        status: targetOrder.status,
        note,
        notifyTarget: 'vendor',
        title: `[Xử lý sự cố] Đơn hàng #${targetOrder.orderCode || targetOrder.id.slice(0, 8)}`,
      });
      await fetchRealOrders();
      alert('Đã cập nhật xử lý sự cố & gửi thông báo thành công đến Vendor đối tác!');
    } catch (err) {
      alert(`Lỗi cập nhật sự cố: ${err.response?.data?.message || err.message}`);
    }
  };

  // 5. Escalate Exception to Admin (Real DB Audit Note & Notify Admin)
  const handleEscalateException = async (orderId, escalateData) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const note = `[Chuyển tiếp Admin xử lý] Ưu tiên: ${escalateData.priority}. Lý do: ${escalateData.reason}. Nội dung: ${escalateData.note}`;
      await ordersApi.updateStatus(orderId, {
        status: targetOrder.status,
        note,
        notifyTarget: 'admin',
        title: `[Báo cáo sự cố] Đơn hàng #${targetOrder.orderCode || targetOrder.id.slice(0, 8)}`,
      });
      await fetchRealOrders();
      alert('Đã chuyển tiếp báo cáo sự cố & gửi thông báo thành công đến Ban Quản Trị (Admin)!');
    } catch (err) {
      alert(`Lỗi chuyển tiếp sự cố: ${err.response?.data?.message || err.message}`);
    }
  };

  // Sync active modal detail order when orders refresh
  useEffect(() => {
    if (detailOrder) {
      const refreshed = orders.find((o) => o.id === detailOrder.id);
      if (refreshed) setDetailOrder(refreshed);
    }
  }, [orders]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isShippingUser =
    user?.department?.includes('Vận chuyển') || user?.department?.includes('Giao nhận');

  return (
    <>
      <Routes>
        <Route
          element={
            <DashboardLayout
              orders={orders}
              pendingCount={countsByStatus?.pending}
              confirmedCount={countsByStatus?.confirmed}
            />
          }
        >
          <Route
            path="/"
            element={
              isShippingUser ? (
                <Navigate to="/shipping" replace />
              ) : (
                <OrdersPage
                  orders={orders}
                  countsByStatus={countsByStatus}
                  totalItems={totalItems}
                  loading={loading}
                  onRefresh={fetchRealOrders}
                  onOpenDetail={(o) => setDetailOrder(o)}
                  onOpenConfirm={(o) => setConfirmOrder(o)}
                  onOpenReject={(o) => setRejectOrder(o)}
                  onOpenTransfer={(o) => setTransferOrder(o)}
                  onOpenException={(o) => setExceptionOrder(o)}
                />
              )
            }
          />
          <Route
            path="/orders"
            element={
              isShippingUser ? (
                <Navigate to="/shipping" replace />
              ) : (
                <OrdersPage
                  orders={orders}
                  countsByStatus={countsByStatus}
                  totalItems={totalItems}
                  loading={loading}
                  onRefresh={fetchRealOrders}
                  onOpenDetail={(o) => setDetailOrder(o)}
                  onOpenConfirm={(o) => setConfirmOrder(o)}
                  onOpenReject={(o) => setRejectOrder(o)}
                  onOpenTransfer={(o) => setTransferOrder(o)}
                  onOpenException={(o) => setExceptionOrder(o)}
                />
              )
            }
          />
          <Route
            path="/vendor-tracking"
            element={
              <VendorTrackingPage
                orders={orders}
                onOpenDetail={(o) => setDetailOrder(o)}
                onOpenException={(o) => setExceptionOrder(o)}
              />
            }
          />
          <Route path="/vendor-approvals" element={<VendorApprovalPage />} />
          <Route path="/shipping" element={<InternalShippingPage />} />
          <Route
            path="/audit-history"
            element={
              <AuditHistoryPage orders={orders} onOpenDetail={(o) => setDetailOrder(o)} />
            }
          />
          <Route path="/permissions-faq" element={<PermissionsFaqPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route
            path="*"
            element={<Navigate to={isShippingUser ? '/shipping' : '/orders'} replace />}
          />
        </Route>
      </Routes>

      {/* Action Modals */}
      <OrderDetailModal
        order={detailOrder}
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        onOpenConfirm={(o) => setConfirmOrder(o)}
        onOpenReject={(o) => setRejectOrder(o)}
        onOpenTransfer={(o) => setTransferOrder(o)}
        onOpenException={(o) => setExceptionOrder(o)}
      />

      <ConfirmOrderModal
        order={confirmOrder}
        isOpen={!!confirmOrder}
        onClose={() => setConfirmOrder(null)}
        onConfirm={handleConfirmOrder}
      />

      <RejectOrderModal
        order={rejectOrder}
        isOpen={!!rejectOrder}
        onClose={() => setRejectOrder(null)}
        onReject={handleRejectOrder}
      />

      <TransferVendorModal
        order={transferOrder}
        isOpen={!!transferOrder}
        onClose={() => setTransferOrder(null)}
        onTransfer={handleTransferVendor}
      />

      <ExceptionModal
        order={exceptionOrder}
        isOpen={!!exceptionOrder}
        onClose={() => setExceptionOrder(null)}
        onResolve={handleResolveException}
        onEscalate={handleEscalateException}
      />
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeBridge />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
