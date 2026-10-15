import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  Store,
  Eye,
  ShieldCheck,
  Check,
  UserCheck
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'pending', label: 'Chờ xác nhận', color: 'text-amber-700 bg-amber-50' },
  { key: 'confirmed', label: 'Đã xác nhận', color: 'text-blue-700 bg-blue-50' },
  { key: 'processing', label: 'Vendor đang xử lý', color: 'text-indigo-700 bg-indigo-50' },
  { key: 'shipping', label: 'Đang vận chuyển', color: 'text-purple-700 bg-purple-50' },
  { key: 'completed', label: 'Hoàn thành', color: 'text-emerald-700 bg-emerald-50' },
  { key: 'cancelled', label: 'Đã từ chối/hủy', color: 'text-rose-700 bg-rose-50' },
];

const STATUS_BADGE = {
  pending: { label: 'Chờ xác nhận', class: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Vendor xử lý', class: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  shipping: { label: 'Đang giao hàng', class: 'bg-purple-100 text-purple-800 border-purple-200' },
  completed: { label: 'Hoàn tất', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Từ chối / Hủy', class: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const OrdersPage = ({
  orders,
  onOpenDetail,
  onOpenConfirm,
  onOpenReject,
  onOpenTransfer,
  onOpenException,
}) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';
  const initialException = searchParams.get('exception') === 'true';

  const [currentTab, setCurrentTab] = useState(initialStatus);
  const [onlyExceptions, setOnlyExceptions] = useState(initialException);
  const [onlyMyScope, setOnlyMyScope] = useState(true);
  const [onlyMyAssigned, setOnlyMyAssigned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL changes
  React.useEffect(() => {
    const s = searchParams.get('status') || 'all';
    const exc = searchParams.get('exception') === 'true';
    setCurrentTab(s);
    setOnlyExceptions(exc);
  }, [searchParams]);

  // Filter orders according to user permissions & filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Scope filter based on employee role
      if (onlyMyScope && user) {
        if (user.assignedOrderScope === 'region_north' && order.region !== 'region_north') {
          return false;
        }
        if (user.assignedOrderScope === 'region_central' && order.region !== 'region_central') {
          return false;
        }
        if (user.assignedOrderScope === 'region_south' && order.region !== 'region_south') {
          return false;
        }
        if (user.assignedOrderScope === 'high_value_orders' && (order.totalAmount || 0) < 1500000) {
          return false;
        }
      }

      // 1.5 Filter by assigned employee
      if (onlyMyAssigned && user) {
        const isMine =
          order.assignedCarrier?.id === user.id ||
          order.assignedCarrier?.employeeCode === user.employeeCode ||
          order.assignedCarrier?.email === user.email ||
          order.shipments?.some((s) => s.carrierId === user.id || s.carrier?.email === user.email);
        if (!isMine) {
          return false;
        }
      }

      // 2. Tab status filter
      if (currentTab !== 'all' && order.status !== currentTab) {
        return false;
      }

      // 3. Exception filter
      if (onlyExceptions && !order.exception) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().replace(/^#/, '').trim();
        const matchesCode = order.orderCode?.toLowerCase().includes(q);
        const matchesName = order.receiverName?.toLowerCase().includes(q);
        const matchesPhone = order.receiverPhone?.includes(q);
        const matchesVendor = 
          (order.orderVendors || []).some((v) => v.name?.toLowerCase().includes(q) || v.code?.toLowerCase().includes(q)) ||
          order.assignedVendor?.name?.toLowerCase().includes(q) ||
          order.assignedVendor?.code?.toLowerCase().includes(q);
        const matchesProduct = (order.details || []).some((d) => d.productName?.toLowerCase().includes(q) || d.vendorName?.toLowerCase().includes(q));
        if (!matchesCode && !matchesName && !matchesPhone && !matchesVendor && !matchesProduct) {
          return false;
        }
      }

      return true;
    });
  }, [orders, currentTab, onlyExceptions, onlyMyScope, onlyMyAssigned, searchQuery, user]);

  // Statistics
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const exceptionCount = orders.filter((o) => o.exception !== null).length;
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Cần xác nhận ngay</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{pendingCount}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Quyền: Duyệt / Từ chối theo quy tắc</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Chờ chuyển Vendor</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{confirmedCount}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Sẵn sàng bàn giao cho nhà cung cấp</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Sự cố đang mở</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{exceptionCount}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Xử lý trong quyền hạn / Escalation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Tổng giá trị đơn hiển thị</span>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {totalValue.toLocaleString()} đ
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{filteredOrders.length} đơn hàng lọc được</p>
        </div>
      </div>

      {/* Scope and Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn (#...), tên khách, SĐT, sản phẩm, hoặc Vendor..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Scope switches */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition">
              <input
                type="checkbox"
                checked={onlyMyScope}
                onChange={(e) => setOnlyMyScope(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700">
                Phạm vi được giao ({user?.scopeName || user?.assignedOrderScope})
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 transition">
              <input
                type="checkbox"
                checked={onlyMyAssigned}
                onChange={(e) => setOnlyMyAssigned(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Đơn tôi phụ trách</span>
              </span>
            </label>

            <button
              onClick={() => setOnlyExceptions(!onlyExceptions)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold border transition ${
                onlyExceptions
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Chỉ xem có sự cố</span>
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pt-2 border-t border-slate-100">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === 'all' ? orders.length : orders.filter((o) => o.status === tab.key).length;
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setCurrentTab(tab.key);
                  setSearchParams(tab.key === 'all' ? {} : { status: tab.key });
                }}
                className={`px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition flex items-center space-x-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mã đơn & Thời gian</th>
                <th className="py-3 px-4">Khách hàng & Khu vực</th>
                <th className="py-3 px-4">Sản phẩm</th>
                <th className="py-3 px-4 text-right">Tổng tiền</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4">Vendor phụ trách</th>
                <th className="py-3 px-4">Nhân viên phụ trách</th>
                <th className="py-3 px-4 text-center">Hành động của Nhân viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Không tìm thấy đơn hàng nào phù hợp</p>
                    <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusBadge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      {/* Order Code & Time */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onOpenDetail(order)}
                          className="font-mono font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 group"
                          title="Mã đơn hàng MIVA - Nhấp để xem chi tiết"
                        >
                          <span className="text-slate-400 group-hover:text-blue-600">#</span>
                          <span>{order.orderCode}</span>
                        </button>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        {order.exception && (
                          <div className="mt-1 flex items-center space-x-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{order.exception.title}</span>
                          </div>
                        )}
                      </td>

                      {/* Customer & Region */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{order.receiverName}</p>
                        <p className="text-[11px] text-slate-500">{order.receiverPhone}</p>
                        <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {order.region === 'region_north' ? 'Miền Bắc' : order.region === 'region_central' ? 'Miền Trung' : 'Miền Nam'}
                        </span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 line-clamp-1">
                          {order.details?.[0]?.productName || 'Sản phẩm'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {order.details?.length > 1
                            ? `+ ${order.details.length - 1} sản phẩm khác`
                            : `${order.details?.[0]?.colorName || ''} • Size ${order.details?.[0]?.sizeName || ''}`}
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <p className="font-bold text-slate-900">{order.totalAmount?.toLocaleString()} đ</p>
                        <span className={`text-[10px] uppercase font-mono ${order.paymentMethod === 'cod' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3.5 px-4">
                        {order.orderVendors?.length > 0 ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-[11px] flex items-center space-x-1">
                              <Store className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="line-clamp-1">{order.orderVendors[0].name}</span>
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded font-semibold">
                                {order.orderVendors[0].code}
                              </span>
                              {order.orderVendors.length > 1 && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 rounded font-medium">
                                  +{order.orderVendors.length - 1} đối tác
                                </span>
                              )}
                            </div>
                          </div>
                        ) : order.assignedVendor ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-[11px] flex items-center space-x-1">
                              <Store className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="line-clamp-1">{order.assignedVendor.name}</span>
                            </p>
                            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded font-semibold">
                              {order.assignedVendor.code}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Chưa bàn giao</span>
                        )}
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-3.5 px-4">
                        {order.assignedCarrier ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-[11px] flex items-center space-x-1">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span className="line-clamp-1">{order.assignedCarrier.fullName}</span>
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-mono font-medium">
                                {order.assignedCarrier.employeeCode}
                              </span>
                              {order.assignedCarrier.department && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                                  {order.assignedCarrier.department}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            Chờ phân công
                          </span>
                        )}
                      </td>

                      {/* Fast Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onOpenDetail(order)}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => onOpenConfirm(order)}
                                title="Xác nhận đơn"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenReject(order)}
                                title="Từ chối theo quy tắc"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <AlertOctagon className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => onOpenTransfer(order)}
                              title="Chuyển đơn cho Vendor"
                              className="px-2 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Chuyển</span>
                            </button>
                          )}

                          <button
                            onClick={() => onOpenException(order)}
                            title="Xử lý / Báo sự cố"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
