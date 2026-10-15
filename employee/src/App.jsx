import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [detailOrder, setDetailOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [rejectOrder, setRejectOrder] = useState(null);
  const [transferOrder, setTransferOrder] = useState(null);
  const [exceptionOrder, setExceptionOrder] = useState(null);

  // Map real backend order to employee UI representation
  const formatOrder = (item) => {
    // Collect all real vendors from order details and vendorOrders
    const orderVendorsMap = new Map();

    (item.details || []).forEach((d) => {
      const v = d.productVariant?.productColor?.product?.vendor;
      const vId = v?.id || d.productVariant?.productColor?.product?.vendorId;
      if (vId && !orderVendorsMap.has(vId)) {
        orderVendorsMap.set(vId, {
          id: vId,
          name: v?.storeName || v?.fullName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
          storeName: v?.storeName || v?.fullName || `Gian hàng đối tác`,
          code: `VND-${vId.slice(0, 6).toUpperCase()}`,
          phone: v?.phone || '0900000000',
          region: v?.address || 'Kho hàng đối tác MIVA',
          slaHours: 12,
          avatarUrl: v?.avatarUrl,
        });
      }
    });

    (item.vendorOrders || []).forEach((vo) => {
      const v = vo.vendor;
      const vId = v?.id || vo.vendorId;
      if (vId && !orderVendorsMap.has(vId)) {
        orderVendorsMap.set(vId, {
          id: vId,
          name: v?.storeName || v?.fullName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
          storeName: v?.storeName || v?.fullName || `Gian hàng đối tác`,
          code: vo.vendorOrderCode || `VND-${vId.slice(0, 6).toUpperCase()}`,
          phone: v?.phone || '0900000000',
          region: v?.address || 'Kho hàng đối tác MIVA',
          slaHours: 12,
          avatarUrl: v?.avatarUrl,
        });
      }
    });

    const orderVendors = Array.from(orderVendorsMap.values());
    const primaryVendor = orderVendors[0] || null;

    const assignedVendor = primaryVendor
      ? {
          ...primaryVendor,
          vendorStatus:
            item.status === 'processing'
              ? 'Đang chuẩn bị kiện hàng'
              : item.status === 'shipping'
              ? 'Đã bàn giao vận chuyển'
              : 'Đang xử lý xuất kho',
          transferredAt: item.updatedAt,
          slaDeadline: new Date(new Date(item.createdAt).getTime() + 24 * 3600 * 1000).toISOString(),
        }
      : null;

    // Region inference
    const address = (item.shippingAddress || '').toLowerCase();
    const region = address.includes('hà nội') || address.includes('hải phòng') || address.includes('bắc')
      ? 'region_north'
      : address.includes('đà nẵng') || address.includes('huế') || address.includes('nha trang')
      ? 'region_central'
      : 'region_south';

    return {
      id: item.id,
      orderCode: item.orderCode,
      clientId: item.clientId,
      receiverName: item.receiverName || 'Khách hàng',
      receiverPhone: item.receiverPhone || '0900000000',
      shippingAddress: item.shippingAddress || 'Việt Nam',
      region: region,
      status: item.status,
      subtotalAmount: Number(item.subtotalAmount) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      shippingFee: Number(item.shippingFee) || 0,
      totalAmount: Number(item.totalAmount) || 0,
      paymentMethod: item.payment?.method || 'cod',
      paymentStatus: item.payment?.status || 'pending',
      notes: item.notes || '',
      createdAt: item.createdAt,
      orderVendors: orderVendors,
      assignedVendor: assignedVendor,
      vendorSlaDeadline: assignedVendor?.slaDeadline || null,
      shipments: item.shipments || [],
      assignedCarrier: item.shipments?.find((s) => s.carrier)?.carrier || null,
      exception: item.statusHistory?.some((h) => h.note?.includes('[Chuyển tiếp Admin]'))
        ? {
            type: 'ESCALATED_ADMIN',
            title: 'Đã chuyển tiếp Admin xử lý',
            severity: 'high',
            reportedBy: 'Nhân viên Miva',
            status: 'escalated',
            suggestedAction: 'Admin đang tiếp nhận hồ sơ',
          }
        : null,
      details: item.details?.map((d) => {
        const prod = d.productVariant?.productColor?.product;
        const vend = prod?.vendor;
        return {
          id: d.id,
          productName: d.productName || prod?.name || 'Sản phẩm',
          vendorId: vend?.id || prod?.vendorId || null,
          vendorName: vend?.storeName || vend?.fullName || 'Gian hàng đối tác',
          colorName: d.colorName || d.productVariant?.productColor?.color || 'Màu tiêu chuẩn',
          sizeName: d.sizeName || d.productVariant?.size || 'Freesize',
          quantity: d.quantity || 1,
          price: Number(d.price) || 0,
          imageUrl: d.imageUrl || d.productVariant?.productColor?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60',
        };
      }) || [],
      statusHistory: item.statusHistory?.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        actorRole: h.note?.includes('[Nhân viên')
          ? 'Nhân viên'
          : h.adminId
          ? 'Admin'
          : h.vendorId
          ? 'Vendor'
          : h.clientId
          ? 'Khách hàng'
          : 'Hệ thống',
        actorName: h.note?.includes('[Nhân viên') ? 'Nhân viên xử lý' : 'Thành viên hệ thống',
        note: h.note || '',
        createdAt: h.createdAt,
      })) || [],
    };
  };

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
    } catch (err) {
      console.error('Lỗi khi tải danh sách đơn hàng thực từ API:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchRealOrders();
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

  // 4. Resolve Exception within Scope (Real DB Audit Note)
  const handleResolveException = async (orderId, resolveData) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const note = `[Xử lý sự cố trong thẩm quyền] Loại: ${resolveData.type}. Kết quả: ${resolveData.note}`;
      await ordersApi.updateStatus(orderId, { status: targetOrder.status, note });
      await fetchRealOrders();
    } catch (err) {
      alert(`Lỗi cập nhật sự cố: ${err.response?.data?.message || err.message}`);
    }
  };

  // 5. Escalate Exception to Admin (Real DB Audit Note)
  const handleEscalateException = async (orderId, escalateData) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) return;
      const note = `[Chuyển tiếp Admin xử lý] Ưu tiên: ${escalateData.priority}. Lý do: ${escalateData.reason}. Nội dung: ${escalateData.note}`;
      await ordersApi.updateStatus(orderId, { status: targetOrder.status, note });
      await fetchRealOrders();
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

  return (
    <>
      <Routes>
        <Route element={<DashboardLayout orders={orders} />}>
          <Route
            path="/"
            element={
              <OrdersPage
                orders={orders}
                loading={loading}
                onRefresh={fetchRealOrders}
                onOpenDetail={(o) => setDetailOrder(o)}
                onOpenConfirm={(o) => setConfirmOrder(o)}
                onOpenReject={(o) => setRejectOrder(o)}
                onOpenTransfer={(o) => setTransferOrder(o)}
                onOpenException={(o) => setExceptionOrder(o)}
              />
            }
          />
          <Route
            path="/orders"
            element={
              <OrdersPage
                orders={orders}
                loading={loading}
                onRefresh={fetchRealOrders}
                onOpenDetail={(o) => setDetailOrder(o)}
                onOpenConfirm={(o) => setConfirmOrder(o)}
                onOpenReject={(o) => setRejectOrder(o)}
                onOpenTransfer={(o) => setTransferOrder(o)}
                onOpenException={(o) => setExceptionOrder(o)}
              />
            }
          />
          <Route path="/vendor-tracking" element={<VendorTrackingPage orders={orders} onOpenDetail={(o) => setDetailOrder(o)} onOpenException={(o) => setExceptionOrder(o)} />} />
          <Route path="/vendor-approvals" element={<VendorApprovalPage />} />
          <Route path="/shipping" element={<InternalShippingPage />} />
          <Route path="/audit-history" element={<AuditHistoryPage orders={orders} onOpenDetail={(o) => setDetailOrder(o)} />} />
          <Route path="/permissions-faq" element={<PermissionsFaqPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
