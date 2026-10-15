import React, { useState, useMemo } from 'react';
import { History, Filter, Search, User, ShieldCheck, Store, ShieldAlert } from 'lucide-react';

export const AuditHistoryPage = ({ orders, onOpenDetail }) => {
  const [filterActor, setFilterActor] = useState('all');
  const [searchCode, setSearchCode] = useState('');

  // Collect all history items across orders
  const allHistories = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      if (order.statusHistory && order.statusHistory.length > 0) {
        order.statusHistory.forEach((h) => {
          list.push({
            ...h,
            orderId: order.id,
            orderCode: order.orderCode,
            orderTotal: order.totalAmount,
            receiverName: order.receiverName,
          });
        });
      }
    });
    // Sort descending by createdAt
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const filtered = useMemo(() => {
    return allHistories.filter((h) => {
      if (filterActor !== 'all') {
        if (filterActor === 'employee' && !h.actorRole?.includes('Nhân viên')) return false;
        if (filterActor === 'admin' && !h.actorRole?.includes('Admin')) return false;
        if (filterActor === 'vendor' && !h.actorRole?.includes('Vendor')) return false;
        if (filterActor === 'client' && !h.actorRole?.includes('Khách hàng')) return false;
      }
      if (searchCode.trim()) {
        const q = searchCode.toLowerCase();
        return (
          h.orderCode.toLowerCase().includes(q) ||
          h.actorName?.toLowerCase().includes(q) ||
          h.note?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allHistories, filterActor, searchCode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center space-x-3 text-slate-800">
          <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Nhật Ký & Lịch Sử Trạng Thái Kiểm Toán</h2>
            <p className="text-xs text-slate-500">
              Minh bạch mọi thao tác chuyển trạng thái đơn hàng được thực hiện bởi Khách hàng, Nhân viên, Vendor và Admin
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="Tìm theo mã đơn, nhân viên thực hiện hoặc ghi chú..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Lọc theo vai trò:</span>
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'employee', label: 'Nhân viên' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'admin', label: 'Admin' },
            { key: 'client', label: 'Khách hàng' },
          ].map((act) => (
            <button
              key={act.key}
              onClick={() => setFilterActor(act.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterActor === act.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-xs">Chưa có nhật ký trạng thái nào</p>
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div key={item.id || idx} className="p-4 hover:bg-slate-50/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {item.orderCode}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                    item.actorRole?.includes('Nhân viên')
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : item.actorRole?.includes('Vendor')
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : item.actorRole?.includes('Admin')
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {item.actorRole || 'Hệ thống'}
                  </span>
                  <span className="font-bold text-slate-800">{item.actorName || 'Thành viên hệ thống'}</span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-0.5">
                  <span>Chuyển trạng thái:</span>
                  <span className="font-semibold text-slate-700 uppercase font-mono">{item.fromStatus || 'Khởi tạo'}</span>
                  <span>→</span>
                  <span className="font-bold text-blue-700 uppercase font-mono">{item.toStatus}</span>
                </div>
                <p className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 max-w-3xl">
                  "{item.note || 'Không có ghi chú'}"
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[11px] text-slate-400">
                  {new Date(item.createdAt).toLocaleTimeString('vi-VN')} • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <button
                  onClick={() => {
                    const found = orders.find((o) => o.id === item.orderId);
                    if (found) onOpenDetail(found);
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
