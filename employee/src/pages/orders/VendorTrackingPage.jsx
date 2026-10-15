import React, { useState } from 'react';
import { 
  Truck, 
  Store, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Send, 
  ShieldAlert, 
  Search,
  Eye
} from 'lucide-react';

export const VendorTrackingPage = ({ orders, onOpenDetail, onOpenException }) => {
  const [searchVendor, setSearchVendor] = useState('');

  // Orders that are currently managed by Vendor
  const vendorOrders = orders.filter(
    (o) => o.assignedVendor !== null || o.status === 'processing' || o.status === 'shipping'
  );

  const filtered = vendorOrders.filter((o) => {
    if (!searchVendor.trim()) return true;
    const q = searchVendor.toLowerCase();
    return (
      o.orderCode.toLowerCase().includes(q) ||
      (o.orderVendors || []).some((v) => v.name?.toLowerCase().includes(q) || v.code?.toLowerCase().includes(q)) ||
      o.assignedVendor?.name.toLowerCase().includes(q) ||
      o.receiverName.toLowerCase().includes(q)
    );
  });

  const getSlaStatus = (deadlineStr) => {
    if (!deadlineStr) return { label: 'Chưa đặt SLA', color: 'bg-slate-100 text-slate-600', isOverdue: false };
    const diffMs = new Date(deadlineStr) - new Date();
    const diffHours = Math.round(diffMs / (1000 * 3600));

    if (diffMs < 0) {
      return {
        label: `Quá hạn SLA ${Math.abs(diffHours)} giờ!`,
        color: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
        isOverdue: true,
      };
    }
    if (diffHours <= 4) {
      return {
        label: `Gấp: Còn ${diffHours} giờ`,
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        isOverdue: false,
      };
    }
    return {
      label: `Còn ${diffHours} giờ (Đúng hạn)`,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      isOverdue: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Truck className="w-4 h-4" />
              <span>Nhiệm vụ giám sát vận hành</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Theo Dõi Tiến Độ VendorOrder & Cam Kết SLA</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Theo dõi việc chuẩn bị hàng, đóng gói kiện hàng và bàn giao cho đơn vị vận chuyển của các đối tác Vendor. Đốc thúc và xử lý kịp thời khi có nguy cơ trễ hạn.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
            <div className="text-center">
              <p className="text-2xl font-black">{vendorOrders.length}</p>
              <p className="text-[10px] text-blue-200">Đơn tại Vendor</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-black text-rose-300">
                {vendorOrders.filter((o) => getSlaStatus(o.assignedVendor?.slaDeadline).isOverdue).length}
              </p>
              <p className="text-[10px] text-rose-200">Quá hạn SLA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchVendor}
            onChange={(e) => setSearchVendor(e.target.value)}
            placeholder="Tìm theo kho vendor hoặc mã đơn hàng..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500">
          Hiển thị <span className="font-bold text-slate-800">{filtered.length}</span> đơn đang phụ trách
        </div>
      </div>

      {/* Grid of Vendor Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((order) => {
          const sla = getSlaStatus(order.assignedVendor?.slaDeadline);
          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border transition p-5 space-y-4 shadow-2xs ${
                sla.isOverdue ? 'border-rose-300 ring-1 ring-rose-300 bg-rose-50/10' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-700 text-sm">{order.orderCode}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${sla.color}`}>
                      {sla.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Khách hàng: <span className="font-semibold text-slate-700">{order.receiverName}</span> ({order.receiverPhone})
                  </p>
                </div>
                <button
                  onClick={() => onOpenDetail(order)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Vendor Card Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span>{order.assignedVendor?.name || 'Tổng kho Miva'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                    {order.assignedVendor?.code || 'VND-SYS'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Trạng thái: <strong className="text-slate-700">{order.assignedVendor?.vendorStatus || 'Đang đóng gói'}</strong></span>
                  <span>Bàn giao: {order.assignedVendor?.transferredAt ? new Date(order.assignedVendor.transferredAt).toLocaleTimeString('vi-VN') : 'Mới gán'}</span>
                </div>
              </div>

              {/* Product preview */}
              <div className="flex items-center space-x-3 text-xs">
                <img
                  src={order.details?.[0]?.imageUrl}
                  alt={order.details?.[0]?.productName}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 line-clamp-1">{order.details?.[0]?.productName}</p>
                  <p className="text-[11px] text-slate-500">
                    {order.details?.[0]?.quantity} sản phẩm • Tổng tiền: {order.totalAmount?.toLocaleString()} đ
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => alert(`Đã gửi thông báo đốc thúc ưu tiên đến kho ${order.assignedVendor?.name}!`)}
                  className="px-3 py-1.5 font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center space-x-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Đốc thúc kho xuất hàng</span>
                </button>

                <button
                  onClick={() => onOpenException(order)}
                  className="px-3 py-1.5 font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center space-x-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Báo sự cố SLA</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
