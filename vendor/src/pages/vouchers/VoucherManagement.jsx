import { useState, useEffect } from 'react';
import { Search, Edit, Lock, Unlock, CalendarPlus, Plus, Loader2 } from 'lucide-react';
import { voucherService } from '../../services/voucherService';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Input, Badge, Modal } from '../../components/ui';
import VoucherFormModal from './VoucherFormModal';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  // Extend Voucher Modal State
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [voucherToExtend, setVoucherToExtend] = useState(null);
  const [extendEndDate, setExtendEndDate] = useState('');
  const [loadingExtend, setLoadingExtend] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await voucherService.getVendorVouchers();
      setVouchers(Array.isArray(data) ? data : (data.list || []));
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filtered = vouchers.filter(v =>
    (v.code || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.name || '').toLowerCase().includes(search.toLowerCase())
  );

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
        await voucherService.updateVoucherStatus(voucher.id, nextStatus);
        fetchVouchers();
      } catch (error) {
        console.error('Failed to update voucher status', error);
        alert(error.response?.data?.message || `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} voucher thất bại`);
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
    setExtendEndDate(addDaysToNow(30));
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = async () => {
    if (!voucherToExtend || !extendEndDate) return;
    try {
      setLoadingExtend(true);
      await voucherService.extendVoucher(voucherToExtend.id, new Date(extendEndDate).toISOString());
      setExtendModalOpen(false);
      await fetchVouchers();
      alert(`Đã gia hạn thành công voucher "${voucherToExtend.code}" đến ${formatDate(extendEndDate)}!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gia hạn voucher thất bại');
    } finally {
      setLoadingExtend(false);
    }
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    await fetchVouchers();
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Voucher Gian hàng</h1>
          <p className="text-slate-500 dark:text-slate-400">Quản lý mã giảm giá áp dụng cho các sản phẩm của shop</p>
        </div>
        <Button icon={Plus} className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddClick}>
          Tạo Voucher
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input 
              placeholder="Tìm theo mã hoặc tên voucher..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mã</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tên Voucher</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Mức giảm</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Đã dùng / Giới hạn</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Thời hạn</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Không tìm thấy voucher nào</td>
                </tr>
              ) : (
                filtered.map(v => {
                  const isLocked = v.status === 'inactive';
                  const isExpired = v.status === 'expired' || (v.endDate && new Date(v.endDate) < new Date());
                  return (
                    <tr key={v.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded font-mono text-sm font-semibold">{v.code}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{v.name}</td>
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
                            className="text-slate-400 hover:text-indigo-600"
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VoucherFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucherToEdit={voucherToEdit}
        onSave={handleSave}
      />

      {/* Modal Gia Hạn Voucher cho Vendor */}
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
              <div>Mã Voucher: <code className="font-bold text-indigo-600 font-mono">{voucherToExtend.code}</code></div>
              <div>Thời hạn hiện tại: <span className="text-slate-500 font-semibold">{formatDate(voucherToExtend.endDate)}</span></div>
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
