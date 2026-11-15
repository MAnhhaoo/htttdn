import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Edit, Lock, Unlock, CalendarPlus, Plus, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { ExtendEndDateModal } from '@shared/components/common/ExtendEndDateModal';
import { vouchersApi } from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatHelpers';
import { Button, Badge, Modal, PaginationFooter, useToast } from '../../components/ui';
import VoucherFormModal from './VoucherFormModal';

export default function VoucherManagement() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voucherToEdit, setVoucherToEdit] = useState(null);

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [voucherToExtend, setVoucherToExtend] = useState(null);

  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const filteredVouchers = useMemo(() => {
    const q = search.toLowerCase();
    return vouchers.filter(v =>
      (v.code || '').toLowerCase().includes(q) ||
      (v.name || '').toLowerCase().includes(q) ||
      (v.categories || []).some(c => (c.name || '').toLowerCase().includes(q))
    );
  }, [vouchers, search]);

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
        toast.success(`Đã ${actionText} mã giảm giá "${voucher.code}" thành công`);
        fetchVouchers();
      } catch (err) {
        toast.error(err.response?.data?.message || `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} voucher thất bại`);
      }
    }
  };

  const handleOpenExtendModal = (voucher) => {
    setVoucherToExtend(voucher);
    setExtendModalOpen(true);
  };

  const handleConfirmSoftDelete = async () => {
    if (!voucherToDelete) return;
    try {
      setDeleting(true);
      await vouchersApi.deleteVoucher(voucherToDelete.id);
      toast.success(`Đã xóa mềm mã giảm giá "${voucherToDelete.code}" thành công`);
      setVoucherToDelete(null);
      await fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa mềm mã giảm giá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async (savedData) => {
    if (voucherToEdit) {
      await vouchersApi.updateVoucher(voucherToEdit.id, savedData);
      toast.success(`Đã cập nhật mã giảm giá "${savedData.code || voucherToEdit.code}"`);
    } else {
      await vouchersApi.createVoucher(savedData);
      toast.success(`Đã tạo mã giảm giá "${savedData.code}" thành công`);
    }
    setIsModalOpen(false);
    await fetchVouchers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý Mã giảm giá Sàn</h1>
          <p className="text-slate-500 dark:text-slate-400">{totalItems} mã giảm giá trong hệ thống</p>
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
              <Loader2 className="w-6 h-6 animate-spin text-[#1A3A2C] dark:text-[#C9A84C]" />
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
                        <span className="font-mono bg-[#EEF5F1] dark:bg-[#1A3A2C]/50 px-2 py-0.5 rounded text-[#1A3A2C] dark:text-[#DEC47E] font-semibold border border-[#2A5C4A]/15 dark:border-[#C9A84C]/25">
                          {v.code}
                        </span>
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
                              <span key={c.id} className="px-2 py-0.5 rounded-full bg-[#FBF7EC] text-[#B08A2E] dark:bg-[#C9A84C]/15 dark:text-[#DEC47E] font-medium">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#EEF5F1] text-[#1A3A2C] dark:bg-[#1A3A2C]/60 dark:text-[#6BB392] font-medium">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            onClick={() => setVoucherToDelete(v)}
                            title="Xóa mềm mã giảm giá"
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

        <PaginationFooter
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          itemLabel="mã giảm giá"
        />
      </div>

      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        voucherToEdit={voucherToEdit}
        onSave={handleSave}
      />

      <ExtendEndDateModal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title={voucherToExtend ? `Gia hạn thời hạn Voucher: ${voucherToExtend.code}` : 'Gia hạn Voucher'}
        itemTitle={voucherToExtend?.name}
        itemCode={voucherToExtend?.code}
        currentEndDate={voucherToExtend?.endDate}
        onConfirm={async (isoEnd) => {
          await vouchersApi.extendVoucher(voucherToExtend.id, isoEnd);
          toast.success(`Đã gia hạn mã giảm giá "${voucherToExtend.code}" thành công`);
          await fetchVouchers();
        }}
      />

      <Modal
        isOpen={Boolean(voucherToDelete)}
        onClose={() => !deleting && setVoucherToDelete(null)}
        title="Xóa mềm mã giảm giá"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoucherToDelete(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmSoftDelete}
              disabled={deleting}
            >
              {deleting ? 'Đang xử lý...' : 'Xác nhận xóa mềm'}
            </Button>
          </div>
        }
      >
        {voucherToDelete && (
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                Thao tác này thực hiện <strong>xóa mềm (Soft Delete)</strong> theo chuẩn an toàn dữ liệu của MIVA.
              </div>
            </div>
            <p className="leading-relaxed">
              Mã giảm giá <strong className="font-mono text-slate-900 dark:text-white">{voucherToDelete.code}</strong> ({voucherToDelete.name}) sẽ được{' '}
              <strong>ẩn khỏi danh sách quản lý và ngừng áp dụng mới</strong>, nhưng{' '}
              <strong>toàn bộ dữ liệu và lịch sử đơn hàng trong cơ sở dữ liệu vẫn được giữ nguyên</strong>.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
