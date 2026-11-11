import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Edit, Lock, Unlock, CalendarPlus, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { vouchersApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Badge, Modal } from '../../components/ui';
import VoucherFormModal from './VoucherFormModal';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Client-side pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  // Extend Voucher Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [voucherToExtend, setVoucherToExtend] = useState(null);
  const [extendEndDate, setExtendEndDate] = useState('');
  const [loadingExtend, setLoadingExtend] = useState(false);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vouchersApi.getVouchers();
      const data = res.data?.list ? res.data.list : (Array.isArray(res.data) ? res.data : []);
      setVouchers(data);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Client-side filtering
  const filteredVouchers = useMemo(() => {
    const q = search.toLowerCase();
    return vouchers.filter(v =>
      (v.code || '').toLowerCase().includes(q) ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.categories || []).some(c => (c.name || '').toLowerCase().includes(q))
    );
  }, [vouchers, search]);

  // Client-side pagination derivation
  const totalItems = filteredVouchers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  const currentVouchers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredVouchers.slice(start, start + itemsPerPage);
  }, [filteredVouchers, page, itemsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAddClick = () => {
    setVoucherToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (voucher) => {
    setVoucherToEdit(voucher);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (voucher) => {
    const isLocked = voucher.status === 'inactive';
    const nextStatus = isLocked ? 'active' : 'inactive';
    const actionText = isLocked ? 'mở khóa' : 'khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} voucher "${voucher.code}"?`)) {
      try {
        await vouchersApi.setStatus(voucher.id, nextStatus);
        fetchVouchers();
      } catch (err) {
        alert(err.response?.data?.message || `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} voucher thất bại`);
      }
    }
  };

  const addDaysToNow = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleOpenExtendModal = (voucher) => {
    setVoucherToExtend(voucher);
    // Default to +30 days from now
    setExtendEndDate(addDaysToNow(30));
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = async () => {
    if (!voucherToExtend || !extendEndDate) return;
    try {
      setLoadingExtend(true);
      await vouchersApi.extendVoucher(voucherToExtend.id, new Date(extendEndDate).toISOString());
      setExtendModalOpen(false);
      await fetchVouchers();
      alert(`Đã gia hạn thành công voucher "${voucherToExtend.code}" đến ${formatDate(extendEndDate)}!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gia hạn voucher thất bại');
    } finally {
      setLoadingExtend(false);
    }
  };

  const handleSave = async (savedData) => {
    if (voucherToEdit) {
      await vouchersApi.updateVoucher(voucherToEdit.id, savedData);
    } else {
      await vouchersApi.createVoucher(savedData);
    }
    setIsModalOpen(false);
    await fetchVouchers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý Voucher</h1>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} vouchers trong hệ thống</p>
        </div>
        <Button icon={Plus} onClick={handleAddClick}>
          Thêm Voucher
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Tìm theo mã, tên hoặc danh mục..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-200" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-slate-500">Đang tải...</span>
            </div>
          ) : currentVouchers.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy voucher nào.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tên</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Phạm vi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Giảm giá</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Lượt dùng</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Thời hạn</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentVouchers.map(v => {
                  const isLocked = v.status === 'inactive';
                  const isExpired = v.status === 'expired' || (v.endDate && new Date(v.endDate) < new Date());
                  return (
                    <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-semibold">{v.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{v.name}</td>
                      <td className="px-4 py-3 text-xs">
                        {v.scope === 'vendor' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-medium">
                            Gian hàng
                          </span>
                        ) : v.categories && v.categories.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {v.categories.map(c => (
                              <span key={c.id} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-medium">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-medium">
                            Toàn sàn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                        {v.discountType === 'percentage' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{v.usedQuantity || 0}/{v.quantity}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        <div>{formatDate(v.startDate)} → {formatDate(v.endDate)}</div>
                        {isExpired && <span className="text-[10px] text-rose-500 font-semibold">(Đã hết hạn)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={isLocked ? 'default' : isExpired ? 'error' : 'success'}>
                          {isLocked ? 'ĐÃ KHÓA' : isExpired ? 'HẾT HẠN' : 'HOẠT ĐỘNG'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={CalendarPlus}
                            className={isExpired ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100' : 'text-slate-400 hover:text-indigo-600'}
                            onClick={() => handleOpenExtendModal(v)}
                            title={isExpired ? 'Voucher đã hết hạn - Bấm để gia hạn' : 'Gia hạn thời hạn voucher'}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            className="text-slate-400 hover:text-amber-600"
                            onClick={() => handleEditClick(v)}
                            title="Chỉnh sửa voucher"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={isLocked ? Unlock : Lock}
                            className={isLocked ? 'text-slate-400 hover:text-emerald-600' : 'text-slate-400 hover:text-amber-600'}
                            onClick={() => handleToggleStatus(v)}
                            title={isLocked ? 'Mở khóa voucher' : 'Khóa voucher'}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronLeft} 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={ChevronRight} 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      <VoucherFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucherToEdit={voucherToEdit}
        onSave={handleSave}
      />

      {/* Modal Gia Hạn Voucher */}
      {extendModalOpen && voucherToExtend && (
        <Modal
          isOpen={extendModalOpen}
          onClose={() => setExtendModalOpen(false)}
          title={`Gia hạn thời hạn Voucher: ${voucherToExtend.code}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div>Chương trình: <strong>{voucherToExtend.name}</strong></div>
              <div>Mã Voucher: <code className="font-bold text-amber-600 font-mono">{voucherToExtend.code}</code></div>
              <div>Thời hạn kết thúc hiện tại: <span className="text-slate-500 font-semibold">{formatDate(voucherToExtend.endDate)}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Chọn nhanh thời hạn gia hạn:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 14, 30, 60].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtendEndDate(addDaysToNow(days))}
                    className="py-1.5 px-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    +{days} ngày
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ngày kết thúc mới:
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={extendEndDate}
                onChange={(e) => setExtendEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setExtendModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmExtend}
                disabled={!extendEndDate || loadingExtend}
              >
                {loadingExtend ? 'Đang gia hạn...' : 'Xác nhận gia hạn'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
