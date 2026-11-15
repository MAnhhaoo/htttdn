import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Edit,
  Lock,
  Unlock,
  CalendarPlus,
  Plus,
  Loader2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { ExtendEndDateModal } from '@shared/components/common/ExtendEndDateModal';
import { voucherService } from '../../services/voucherService';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Input, Badge, Modal, useToast } from '../../components/ui';
import VoucherFormModal from './VoucherFormModal';

export default function VoucherManagement() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [voucherToExtend, setVoucherToExtend] = useState(null);

  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await voucherService.getVendorVouchers();
      setVouchers(Array.isArray(data) ? data : data?.list || []);
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const filtered = vouchers.filter(
    (v) =>
      (v.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.name || '').toLowerCase().includes(search.toLowerCase()),
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
        toast.success(`Đã ${actionText} voucher "${voucher.code}".`);
        fetchVouchers();
      } catch (error) {
        console.error('Failed to update voucher status', error);
        toast.error(
          error.response?.data?.message ||
            `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} voucher thất bại.`,
        );
      }
    }
  };

  const handleOpenExtendModal = (voucher) => {
    setVoucherToExtend(voucher);
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = async (isoEnd) => {
    if (!voucherToExtend) return;
    await voucherService.extendVoucher(voucherToExtend.id, isoEnd);
    await fetchVouchers();
    toast.success(
      `Đã gia hạn voucher "${voucherToExtend.code}" đến ${formatDate(isoEnd)}!`,
    );
  };

  const handleSave = async () => {
    setIsModalOpen(false);
    toast.success(
      voucherToEdit ? 'Đã cập nhật voucher gian hàng!' : 'Đã tạo voucher gian hàng mới!',
    );
    await fetchVouchers();
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete || isDeleting) return;
    const target = voucherToDelete;
    try {
      setIsDeleting(true);
      await voucherService.deleteVoucher(target.id);
      toast.success(`Đã xóa mềm voucher "${target.code}" khỏi danh sách hiển thị.`);
      setVoucherToDelete(null);
      await fetchVouchers();
    } catch (error) {
      console.error('Failed to delete voucher', error);
      toast.error(
        error.response?.data?.message || 'Xóa mềm voucher thất bại. Vui lòng thử lại.',
      );
    } finally {
      setIsDeleting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Mã giảm giá Shop
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý chương trình khuyến mãi và mã giảm giá áp dụng riêng cho sản phẩm của gian hàng
          </p>
        </div>
        <Button
          icon={Plus}
          className="bg-indigo-600 hover:bg-indigo-700 text-white self-start sm:self-auto"
          onClick={handleAddClick}
        >
          Tạo Voucher mới
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Tìm theo mã hoặc tên chương trình voucher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Mã
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Tên Voucher
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Mức giảm
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Đã dùng / Giới hạn
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Thời hạn
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-sm text-slate-500">
                    Không tìm thấy voucher nào
                  </td>
                </tr>
              ) : (
                filtered.map((v) => {
                  const isLocked = v.status === 'inactive';
                  const isExpired =
                    v.status === 'expired' || (v.endDate && new Date(v.endDate) < new Date());
                  return (
                    <tr
                      key={v.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded font-mono text-sm font-semibold">
                          {v.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                        {v.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                        {v.discountType === 'percentage'
                          ? `${v.discountValue}%`
                          : formatCurrency(v.discountValue)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {v.usedQuantity || 0}/{v.quantity}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        <div>
                          {formatDate(v.startDate)} → {formatDate(v.endDate)}
                        </div>
                        {isExpired && (
                          <span className="text-[10px] text-rose-500 font-semibold">
                            (Đã hết hạn)
                          </span>
                        )}
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
                            className={
                              isExpired
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
                                : 'text-slate-400 hover:text-indigo-600'
                            }
                            onClick={() => handleOpenExtendModal(v)}
                            title={
                              isExpired
                                ? 'Voucher đã hết hạn - Bấm để gia hạn'
                                : 'Gia hạn thời hạn voucher'
                            }
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
                            className={
                              isLocked
                                ? 'text-slate-400 hover:text-emerald-600'
                                : 'text-slate-400 hover:text-amber-600'
                            }
                            onClick={() => handleToggleStatus(v)}
                            title={isLocked ? 'Mở khóa voucher' : 'Khóa voucher'}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => setVoucherToDelete(v)}
                            title="Xóa mềm voucher gian hàng"
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

      <ExtendEndDateModal
        isOpen={extendModalOpen && Boolean(voucherToExtend)}
        onClose={() => setExtendModalOpen(false)}
        title={`Gia hạn thời hạn Voucher: ${voucherToExtend?.code || ''}`}
        itemTitle={voucherToExtend?.name}
        itemCode={voucherToExtend?.code}
        currentEndDate={voucherToExtend?.endDate}
        onConfirm={handleConfirmExtend}
      />

      <Modal
        isOpen={Boolean(voucherToDelete)}
        onClose={() => {
          if (!isDeleting) setVoucherToDelete(null);
        }}
        title="Xóa mềm Voucher gian hàng"
        maxWidth="max-w-lg"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isDeleting}
              onClick={() => setVoucherToDelete(null)}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="danger"
              icon={isDeleting ? Loader2 : Trash2}
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className={isDeleting ? '[&_svg]:animate-spin' : ''}
            >
              {isDeleting ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}
            </Button>
          </>
        }
      >
        {voucherToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                Bạn có chắc chắn muốn xóa mềm voucher{' '}
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {voucherToDelete.code}
                </span>
                {voucherToDelete.name ? ` (${voucherToDelete.name})` : ''}?
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                • Voucher sẽ được <strong className="text-slate-800 dark:text-slate-100">ẩn khỏi danh sách hiển thị</strong> của gian hàng và không thể áp dụng cho các đơn hàng mới.
              </p>
              <p>
                • Toàn bộ dữ liệu cấu hình và <strong className="text-slate-800 dark:text-slate-100">lịch sử đơn hàng đã áp dụng mã trong cơ sở dữ liệu vẫn được giữ nguyên 100%</strong> để phục vụ đối soát doanh thu.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
