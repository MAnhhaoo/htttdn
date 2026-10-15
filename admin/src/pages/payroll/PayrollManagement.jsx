import { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, DollarSign, Calendar, Filter, RefreshCw, CheckCircle2, 
  Clock, AlertCircle, Edit, Check, CreditCard, ChevronLeft, ChevronRight,
  TrendingUp, Users, FileSpreadsheet, Building2, User
} from 'lucide-react';
import { payrollApi } from '../../api';
import { Button, Input, Modal, Badge } from '../../components/ui';

const STATUS_CONFIG = {
  draft: { label: 'Bản nháp', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  approved: { label: 'Đã duyệt', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  paid: { label: 'Đã thanh toán', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

const formatVND = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(val) || 0);
};

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
  const [year, setYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editBonus, setEditBonus] = useState(0);
  const [editAllowances, setEditAllowances] = useState(0);
  const [editDeductions, setEditDeductions] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        month,
        year,
        ...(department ? { department } : {}),
        ...(status ? { status } : {}),
      };

      const res = await payrollApi.getPayrolls(params);
      const raw = res.data || res;
      const list = raw.list || (Array.isArray(raw) ? raw : []);
      setPayrolls(list);
    } catch (err) {
      console.error('Error fetching payrolls:', err);
    } finally {
      setLoading(false);
    }
  }, [month, year, department, status]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  // Handle calculate payroll engine
  const handleCalculatePayroll = async () => {
    if (!window.confirm(`Xác nhận tính toán bảng lương tự động cho Tháng ${month}/${year}?`)) {
      return;
    }
    try {
      setCalculating(true);
      await payrollApi.calculate({ month: Number(month), year: Number(year) });
      alert(`Đã tính toán và cập nhật bảng lương Tháng ${month}/${year} thành công!`);
      fetchPayrolls();
    } catch (err) {
      alert(`Lỗi tính bảng lương: ${err.response?.data?.message || err.message}`);
    } finally {
      setCalculating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditBonus(Number(item.bonus) || 0);
    setEditAllowances(Number(item.allowances) || 0);
    setEditDeductions(Number(item.deductions) || 0);
    setEditNotes(item.notes || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await payrollApi.updatePayroll(editingItem.id, {
        bonus: Number(editBonus),
        allowances: Number(editAllowances),
        deductions: Number(editDeductions),
        notes: editNotes,
      });
      setEditingItem(null);
      fetchPayrolls();
    } catch (err) {
      alert(`Lỗi cập nhật phiếu lương: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Quick Status Actions
  const handleUpdateStatus = async (item, newStatus) => {
    const actionLabel = newStatus === 'approved' ? 'phê duyệt' : 'xác nhận đã chi trả';
    if (!window.confirm(`Xác nhận ${actionLabel} phiếu lương cho nhân viên ${item.employee?.fullName}?`)) {
      return;
    }
    try {
      await payrollApi.updatePayroll(item.id, { status: newStatus });
      fetchPayrolls();
    } catch (err) {
      alert(`Lỗi: ${err.response?.data?.message || err.message}`);
    }
  };

  // Summary Metrics
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.netSalary || 0), 0);
  const fulltimeCount = payrolls.filter(p => p.employmentType === 'full_time').length;
  const parttimeCount = payrolls.filter(p => p.employmentType === 'part_time').length;
  const paidCount = payrolls.filter(p => p.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-emerald-600" />
            Quản trị Bảng lương & Chấm công (Payroll Engine)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tính toán tự động tiền lương theo hợp đồng Full-time / Part-time, kiểm duyệt và chi trả minh bạch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button 
            variant="outline" 
            onClick={fetchPayrolls} 
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button 
            onClick={handleCalculatePayroll} 
            disabled={calculating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-xs"
          >
            <Calculator className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'Đang tính toán...' : `Tính lương Tháng ${month}/${year}`}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng quỹ lương</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatVND(totalNet)}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên Full-time</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{fulltimeCount} <span className="text-xs text-slate-400 font-normal">nhân sự</span></p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhân viên Part-time</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{parttimeCount} <span className="text-xs text-slate-400 font-normal">nhân sự</span></p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đã hoàn tất chi trả</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {paidCount} / {payrolls.length} <span className="text-xs text-slate-400 font-normal">phiếu</span>
            </p>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase">Kỳ lương:</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-48">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Tất cả phòng ban</option>
              <option value="Phòng Quản lý & Vận hành Đơn hàng">Phòng Quản lý & Vận hành Đơn hàng</option>
              <option value="Tổ Kiểm duyệt & Xác nhận Đơn hàng">Tổ Kiểm duyệt & Xác nhận Đơn hàng</option>
              <option value="Bộ phận Điều phối & Liên kết Vendor">Bộ phận Điều phối & Liên kết Vendor</option>
              <option value="Bộ phận Xử lý Sự cố & Ngoại lệ Đơn">Bộ phận Xử lý Sự cố & Ngoại lệ Đơn</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="approved">Đã phê duyệt</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Đang xem: <span className="text-slate-800 dark:text-white font-bold">{payrolls.length}</span> phiếu lương
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nhân sự & Phòng ban</th>
                <th className="px-5 py-3.5 font-semibold">Hợp đồng</th>
                <th className="px-5 py-3.5 font-semibold text-right">Lương định mức</th>
                <th className="px-5 py-3.5 font-semibold text-center">Giờ công</th>
                <th className="px-5 py-3.5 font-semibold text-right">Phụ cấp & Thưởng</th>
                <th className="px-5 py-3.5 font-semibold text-right">Khấu trừ</th>
                <th className="px-5 py-3.5 font-semibold text-right">Thực nhận (Net)</th>
                <th className="px-5 py-3.5 font-semibold text-center">Trạng thái</th>
                <th className="px-5 py-3.5 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Đang tải dữ liệu bảng lương...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    <Calculator className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    Chưa có bảng lương cho Tháng {month}/{year}.
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        onClick={handleCalculatePayroll} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Bấm để tính lương tự động ngay
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                payrolls.map((p) => {
                  const statusConf = STATUS_CONFIG[p.status] || { label: p.status, color: 'bg-slate-100 text-slate-600' };
                  const isPartTime = p.employmentType === 'part_time';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {p.employee?.fullName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{p.employee?.employeeCode}</span>
                          <span>•</span>
                          <span className="text-slate-500">{p.employee?.department || 'Chung'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {isPartTime ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-200 dark:border-indigo-800">
                            Part-time
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800">
                            Full-time
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {isPartTime ? (
                          <div>
                            <span>{formatVND(p.hourlyRate)}</span>
                            <span className="text-[11px] text-slate-400 block">/ giờ</span>
                          </div>
                        ) : (
                          <div>
                            <span>{formatVND(p.baseSalary)}</span>
                            <span className="text-[11px] text-slate-400 block">/ tháng</span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        {isPartTime ? (
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                            {Number(p.totalHours || 0).toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Tiêu chuẩn</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-emerald-600 font-medium text-xs">
                        +{formatVND(Number(p.allowances) + Number(p.bonus))}
                        {(Number(p.allowances) > 0 || Number(p.bonus) > 0) && (
                          <span className="text-[10px] text-slate-400 block">
                            PC: {formatVND(p.allowances)} | T: {formatVND(p.bonus)}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-rose-500 font-medium text-xs">
                        -{formatVND(p.deductions)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {formatVND(p.netSalary)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                            title="Điều chỉnh thưởng/phụ cấp/khấu trừ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {p.status === 'draft' && (
                            <button
                              onClick={() => handleUpdateStatus(p, 'approved')}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition"
                              title="Phê duyệt phiếu lương"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {p.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(p, 'paid')}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition"
                              title="Xác nhận đã thanh toán lương"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Edit Payroll Adjustment Modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Điều chỉnh Phiếu Lương: ${editingItem?.employee?.fullName} (${editingItem?.employee?.employeeCode})`}
      >
        {editingItem && (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Kỳ tính lương:</span>
                <span className="font-semibold text-slate-800 dark:text-white">Tháng {editingItem.month}/{editingItem.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Loại hợp đồng:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {editingItem.employmentType === 'full_time' ? 'Full-time' : 'Part-time'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lương cơ bản / Tổng giờ:</span>
                <span className="font-semibold text-slate-800 dark:text-white">
                  {editingItem.employmentType === 'full_time'
                    ? formatVND(editingItem.baseSalary)
                    : `${Number(editingItem.totalHours || 0)} giờ × ${formatVND(editingItem.hourlyRate)} = ${formatVND(Number(editingItem.totalHours || 0) * Number(editingItem.hourlyRate || 0))}`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tiền Thưởng (VNĐ):
                </label>
                <Input
                  type="number"
                  value={editBonus}
                  onChange={(e) => setEditBonus(e.target.value)}
                  min="0"
                  step="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phụ Cấp (VNĐ):
                </label>
                <Input
                  type="number"
                  value={editAllowances}
                  onChange={(e) => setEditAllowances(e.target.value)}
                  min="0"
                  step="10000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Khấu Trừ (VNĐ):
                </label>
                <Input
                  type="number"
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(e.target.value)}
                  min="0"
                  step="10000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ghi chú điều chỉnh:
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="VD: Thưởng vượt chỉ tiêu doanh số Q3, phạt đi muộn 2 lần..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estimated Net Salary Preview */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Lương Thực Nhận Sau Điều Chỉnh:
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatVND(
                  (editingItem.employmentType === 'full_time'
                    ? Number(editingItem.baseSalary)
                    : Number(editingItem.totalHours || 0) * Number(editingItem.hourlyRate || 0)) +
                  Number(editAllowances || 0) +
                  Number(editBonus || 0) -
                  Number(editDeductions || 0)
                )}
              </span>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" type="button" onClick={() => setEditingItem(null)}>
                Hủy
              </Button>
              <Button type="submit" disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
