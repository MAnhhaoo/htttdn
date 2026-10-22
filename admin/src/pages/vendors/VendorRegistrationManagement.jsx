import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Store,
  ShieldCheck,
  Eye,
  Calendar,
  CreditCard,
  Percent,
  Check,
  X,
  Building,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { vendorsApi } from '../../api';
import { Button, Input, Badge, Modal } from '../../components/ui';

export default function VendorRegistrationManagement() {
  const [activeTab, setActiveTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({
    list: [],
    totalItems: 0,
    totalPages: 1,
    counts: { pending: 0, renewals: 0, active: 0, expired: 0, rejected: 0 },
  });

  // Action Modals
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Approve Form State
  const [approvePlan, setApprovePlan] = useState('1_year');
  const [approveCommission, setApproveCommission] = useState(8.0);
  const [approveNote, setApproveNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reject Form State
  const [rejectReason, setRejectReason] = useState('');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorsApi.getRegistrations({
        tab: activeTab,
        page,
        itemPerPage: 10,
        search: search || undefined,
      });
      const result = res.data?.data !== undefined ? res.data.data : res.data;
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search]);

  const openApproveModal = (vendor) => {
    setSelectedVendor(vendor);
    setApprovePlan(vendor.renewalPlan || vendor.subscriptionPlan || '1_year');
    setApproveCommission(vendor.commissionRate || 8.0);
    setApproveNote('');
    setApproveModalOpen(true);
  };

  const openRejectModal = (vendor) => {
    setSelectedVendor(vendor);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const openDetailModal = (vendor) => {
    setSelectedVendor(vendor);
    setDetailModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedVendor) return;
    try {
      setSubmitting(true);
      await vendorsApi.approveRegistration(selectedVendor.id, {
        plan: approvePlan,
        commissionRate: Number(approveCommission),
        note: approveNote,
      });
      alert('Đã phê duyệt hồ sơ đối tác thành công!');
      setApproveModalOpen(false);
      fetchRegistrations();
    } catch (err) {
      alert(`Phê duyệt thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVendor) return;
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setSubmitting(true);
      await vendorsApi.rejectRegistration(selectedVendor.id, {
        reason: rejectReason,
      });
      alert('Đã từ chối hồ sơ đối tác');
      setRejectModalOpen(false);
      fetchRegistrations();
    } catch (err) {
      alert(`Thao tác thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const tabs = [
    { id: 'pending', label: 'Chờ duyệt hồ sơ mới', count: data.counts?.pending || 0, color: 'bg-amber-500' },
    { id: 'renewals', label: 'Yêu cầu gia hạn', count: data.counts?.renewals || 0, color: 'bg-blue-500' },
    { id: 'active', label: 'Đang hoạt động', count: data.counts?.active || 0, color: 'bg-emerald-500' },
    { id: 'expired', label: 'Hết hạn / Tạm khóa', count: data.counts?.expired || 0, color: 'bg-rose-500' },
    { id: 'rejected', label: 'Đã từ chối', count: data.counts?.rejected || 0, color: 'bg-slate-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Phê duyệt & Quản lý Đăng ký Kinh doanh Đối tác
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Xét duyệt vendor mới, quản lý thời hạn gói kinh doanh (1 năm / 2 năm), gia hạn và áp dụng chiết khấu hoa hồng sàn khi giao đơn thành công
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chờ duyệt mới</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {data.counts?.pending || 0}
          </div>
          <span className="text-xs text-amber-600 font-medium">Hồ sơ đối tác mới</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cần gia hạn</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {data.counts?.renewals || 0}
          </div>
          <span className="text-xs text-blue-600 font-medium">Yêu cầu gia hạn thêm 1-2 năm</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang hoạt động</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {data.counts?.active || 0}
          </div>
          <span className="text-xs text-emerald-600 font-medium">Còn hạn kinh doanh</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Hết hạn / Tạm khóa</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">
            {data.counts?.expired || 0}
          </div>
          <span className="text-xs text-rose-600 font-medium">Cần nạp phí để mở lại</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, đại diện, MST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-y border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Gian hàng & Đối tác</th>
                <th className="py-3 px-4">Gói đăng ký & Phí</th>
                <th className="py-3 px-4">Hoa hồng sàn (%)</th>
                <th className="py-3 px-4">Hạn hoạt động</th>
                <th className="py-3 px-4">Trạng thái hồ sơ</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải dữ liệu hồ sơ đối tác...
                  </td>
                </tr>
              ) : data.list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không có hồ sơ nào trong mục này.
                  </td>
                </tr>
              ) : (
                data.list.map((vendor) => {
                  const plan = vendor.renewalPlan || vendor.subscriptionPlan || '1_year';
                  const fee = vendor.subscriptionFee || (plan === '2_years' ? 2000000 : 1200000);
                  const isExp = vendor.isExpired;

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                            {vendor.avatarUrl ? (
                              <img src={vendor.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Store className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              {vendor.storeName || vendor.fullName}
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                {vendor.id.slice(0, 8)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Đại diện: <strong className="text-slate-600 dark:text-slate-300">{vendor.fullName}</strong> • SĐT: {vendor.phone || 'Chưa có'}
                            </div>
                            {vendor.taxId && (
                              <div className="text-[11px] text-slate-400">MST: {vendor.taxId}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {plan === '2_years' ? 'Gói 2 Năm' : 'Gói 1 Năm'}
                        </div>
                        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(fee)}
                        </div>
                        {vendor.renewalRequested && (
                          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                            Xin gia hạn {vendor.renewalPlan === '2_years' ? '2 Năm' : '1 Năm'}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Percent className="w-3.5 h-3.5" />
                          {vendor.commissionRate ? `${vendor.commissionRate}%` : '8.00%'}
                        </div>
                        <div className="text-[11px] text-slate-400">/ đơn giao thành công</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {formatDate(vendor.subscriptionExpiresAt)}
                        </div>
                        {vendor.subscriptionExpiresAt && (
                          <div className="text-[11px] mt-0.5">
                            {isExp ? (
                              <span className="text-rose-500 font-semibold">Đã quá hạn</span>
                            ) : vendor.daysRemaining <= 30 ? (
                              <span className="text-amber-500 font-semibold">Còn {vendor.daysRemaining} ngày</span>
                            ) : (
                              <span className="text-slate-400">Còn {vendor.daysRemaining} ngày</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {vendor.approvalStatus === 'pending_approval' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <Clock className="w-3 h-3" /> Chờ duyệt mới
                          </span>
                        ) : vendor.renewalRequested ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                            <RefreshCw className="w-3 h-3" /> Chờ duyệt gia hạn
                          </span>
                        ) : vendor.approvalStatus === 'approved' ? (
                          isExp ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                              <AlertTriangle className="w-3 h-3" /> Tạm khóa (Hết hạn)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                              <CheckCircle className="w-3 h-3" /> Đang hoạt động
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <XCircle className="w-3 h-3" /> Bị từ chối
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDetailModal(vendor)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {(vendor.approvalStatus === 'pending_approval' || vendor.renewalRequested || isExp) && (
                            <>
                              <button
                                onClick={() => openApproveModal(vendor)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
                                title="Phê duyệt hồ sơ / gia hạn"
                              >
                                <Check className="w-3.5 h-3.5" /> Duyệt
                              </button>

                              <button
                                onClick={() => openRejectModal(vendor)}
                                className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium flex items-center gap-1 border border-rose-200 dark:border-rose-800/60 transition-colors"
                                title="Từ chối"
                              >
                                <X className="w-3.5 h-3.5" /> Từ chối
                              </button>
                            </>
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

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
            <span className="text-slate-500">
              Trang {data.page} / {data.totalPages} (Tổng {data.totalItems} đối tác)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Approve */}
      {approveModalOpen && selectedVendor && (
        <Modal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          title={`Phê duyệt đối tác: ${selectedVendor.storeName || selectedVendor.fullName}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div><strong className="text-slate-700 dark:text-slate-200">Gian hàng:</strong> {selectedVendor.storeName || selectedVendor.fullName}</div>
              <div><strong className="text-slate-700 dark:text-slate-200">Người đại diện:</strong> {selectedVendor.fullName} ({selectedVendor.email})</div>
              <div><strong className="text-slate-700 dark:text-slate-200">Mã số thuế:</strong> {selectedVendor.taxId || 'Chưa cung cấp'}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 uppercase">
                Gói đăng ký thời hạn
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setApprovePlan('1_year')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    approvePlan === '1_year'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Gói 1 Năm</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">1.200.000 ₫</div>
                </div>

                <div
                  onClick={() => setApprovePlan('2_years')}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    approvePlan === '2_years'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Gói 2 Năm</div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">2.000.000 ₫</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 uppercase">
                Tỷ lệ chiết khấu hoa hồng sàn (%) trên đơn hàng hoàn tất
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={approveCommission}
                onChange={(e) => setApproveCommission(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <span className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 block">
                Mặc định: 5.00%. Áp dụng tự động khi đơn hàng giao thành công.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5 uppercase">
                Ghi chú phê duyệt (tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Đã đối soát thanh toán phí qua ngân hàng, hồ sơ hợp lệ..."
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setApproveModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button onClick={handleApprove} disabled={submitting}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận Phê duyệt & Kích hoạt'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Reject */}
      {rejectModalOpen && selectedVendor && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Từ chối hồ sơ đối tác: ${selectedVendor.storeName || selectedVendor.fullName}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Vui lòng nhập lý do từ chối hồ sơ đăng ký hoặc yêu cầu gia hạn của đối tác để phản hồi qua email/thông báo:
            </p>

            <textarea
              rows={3}
              placeholder="Ví dụ: Chưa hoàn tất thanh toán phí thường niên, thông tin người đại diện chưa khớp với giấy tờ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận Từ chối'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detail */}
      {detailModalOpen && selectedVendor && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Hồ sơ chi tiết Đối tác kinh doanh"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-white">{selectedVendor.storeName || selectedVendor.fullName}</h3>
                <p className="text-xs text-slate-400">ID: {selectedVendor.id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium">
                    {selectedVendor.subscriptionPlan === '2_years' ? 'Gói 2 Năm' : 'Gói 1 Năm'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                    Hoa hồng sàn: {selectedVendor.commissionRate || 8}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Người đại diện</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedVendor.fullName}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Email liên hệ</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedVendor.email}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Số điện thoại</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedVendor.phone || 'Chưa cung cấp'}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Mã số thuế</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{selectedVendor.taxId || 'Chưa cung cấp'}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Ngày đăng ký</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(selectedVendor.createdAt)}</div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60">
                <div className="text-slate-400 mb-0.5">Ngày hết hạn</div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">{formatDate(selectedVendor.subscriptionExpiresAt)}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
              <div className="text-slate-400 mb-0.5">Địa chỉ kho hàng / kinh doanh</div>
              <div className="font-medium text-slate-700 dark:text-slate-200">{selectedVendor.address || 'Chưa cập nhật địa chỉ'}</div>
            </div>

            {selectedVendor.approvedBy && (
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl text-xs space-y-1">
                <div className="text-indigo-900 dark:text-indigo-200 font-semibold">Lịch sử phê duyệt gần nhất:</div>
                <div className="text-slate-600 dark:text-slate-300">Người duyệt: <strong>{selectedVendor.approvedBy}</strong></div>
                <div className="text-slate-600 dark:text-slate-300">Thời gian: {formatDate(selectedVendor.approvedAt)}</div>
              </div>
            )}

            {selectedVendor.rejectedReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl text-xs space-y-1">
                <div className="text-rose-900 dark:text-rose-200 font-semibold">Lý do từ chối:</div>
                <div className="text-rose-700 dark:text-rose-300">{selectedVendor.rejectedReason}</div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
