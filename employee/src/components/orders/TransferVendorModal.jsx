import React, { useState, useEffect, useMemo } from 'react';
import { Send, Store, Clock, X, Check, ShieldCheck, AlertCircle, Package } from 'lucide-react';

export const TransferVendorModal = ({ order, isOpen, onClose, onTransfer }) => {
  const orderVendors = useMemo(() => {
    if (order?.orderVendors && order.orderVendors.length > 0) {
      return order.orderVendors;
    }
    // Fallback extraction from order.details
    const map = new Map();
    (order?.details || []).forEach((d) => {
      const vId = d.vendorId;
      if (vId && !map.has(vId)) {
        map.set(vId, {
          id: vId,
          name: d.vendorName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
          storeName: d.vendorName || `Gian hàng đối tác`,
          code: `VND-${vId.slice(0, 6).toUpperCase()}`,
          phone: '0900000000',
          region: 'Kho hàng đối tác MIVA',
          slaHours: 12,
        });
      }
    });
    return Array.from(map.values());
  }, [order]);

  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [slaHours, setSlaHours] = useState(12);
  const [note, setNote] = useState('Đơn đã xác nhận thành công. Vui lòng đóng gói và in phiếu gửi trước thời hạn.');

  useEffect(() => {
    if (orderVendors.length > 0) {
      setSelectedVendorId(orderVendors[0].id);
      setSlaHours(orderVendors[0].slaHours || 12);
    }
  }, [orderVendors]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const vendor = orderVendors.find((v) => v.id === selectedVendorId) || orderVendors[0];
    if (!vendor) {
      alert('Đơn hàng không chứa thông tin đối tác hợp lệ.');
      return;
    }

    onTransfer(order.id, vendor, slaHours, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/50">
          <div className="flex items-center space-x-2 text-blue-600">
            <Send className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Bàn Giao Đơn Cho Đối Tác Bán Hàng</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900">
            <p>
              <span className="font-bold">Đơn hàng:</span> <span className="font-mono font-bold">{order.orderCode}</span>
            </p>
            <p className="mt-0.5">
              Sản phẩm: {order.details?.length || 1} mặt hàng - Tổng tiền: {order.totalAmount?.toLocaleString()} đ
            </p>
            <p className="text-[11px] text-blue-700 mt-1">
              Sau khi chuyển, đơn sẽ sang trạng thái <span className="font-semibold uppercase">Processing</span> và Vendor sở hữu sản phẩm sẽ nhận được thông báo để xuất kho đóng gói.
            </p>
          </div>

          {/* Authorization & Real Vendor Binding Notice */}
          {orderVendors.length <= 1 ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Ràng buộc quyền hạn điều phối:</p>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  Khách hàng đặt mua sản phẩm của gian hàng{' '}
                  <span className="font-bold underline">{orderVendors[0]?.name || 'Đối tác chính thức'}</span>. 
                  Theo quy định hệ thống, nhân viên chỉ có quyền chuyển đơn cho đúng Vendor này để chuẩn bị hàng.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Đơn hàng chứa sản phẩm từ {orderVendors.length} gian hàng:</p>
                <p className="text-amber-800 mt-0.5 leading-relaxed">
                  Vui lòng chọn gian hàng đối tác phụ trách để bàn giao đợt xuất kho tương ứng.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Nhà Cung Cấp / Đối Tác Phụ Trách: <span className="text-blue-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {orderVendors.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                  Không tìm thấy thông tin vendor từ sản phẩm trong đơn.
                </div>
              ) : (
                orderVendors.map((vendor) => {
                  const isSelected = selectedVendorId === vendor.id;
                  const vendorProducts = (order.details || []).filter(
                    (d) => d.vendorId === vendor.id
                  );
                  return (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        setSelectedVendorId(vendor.id);
                        if (vendor.slaHours) setSlaHours(vendor.slaHours);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-800">{vendor.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                              {vendor.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {vendor.region} • Hotline: {vendor.phone}
                          </p>
                          {vendorProducts.length > 0 && (
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Package className="w-3 h-3 text-slate-400" />
                              {vendorProducts.length} sản phẩm thuộc gian hàng này
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          Vendor chính thức
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Thời hạn cam kết xử lý (SLA đóng gói):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[8, 12, 24, 36].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setSlaHours(hours)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    slaHours === hours
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {hours} Giờ
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Ghi chú chỉ dẫn cho Vendor:
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập yêu cầu kiểm tra hoặc đóng gói..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={orderVendors.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Chuyển đơn cho Vendor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

