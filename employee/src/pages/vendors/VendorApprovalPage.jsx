import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Search,
  Store,
  Check,
  X,
  Eye,
  Percent,
  Calendar,
  Lock,
} from 'lucide-react';
import { vendorsApi } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

export const VendorApprovalPage = () => {
  const { user } = useAuth();
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

  // Modal states
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Form states
  const [approvePlan, setApprovePlan] = useState('1_year');
  const [approveCommission, setApproveCommission] = useState(8.0);
  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check employee permission
  const permissions = user?.permissions || {};
  const canApprove = permissions.vendors?.canApproveVendor === true ||
    (user?.department?.includes('Liên kết Vendor') && permissions.restrictions?.canManageVendors !== true);
  const isRestricted = !canApprove;

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorsApi.getRegistrations({
        tab: activeTab,
        page,
        itemPerPage: 10,
        search: search || undefined,
      });
      const result = res.data !== undefined ? res.data : res;
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
    { id: 'pending', label: 'Chờ duyệt mới', count: data.counts?.pending || 0 },
    { id: 'renewals', label: 'Yêu cầu gia hạn', count: data.counts?.renewals || 0 },
    { id: 'active', label: 'Đang hoạt động', count: data.counts?.active || 0 },
    { id: 'expired', label: 'Hết hạn / Tạm khóa', count: data.counts?.expired || 0 },
    { id: 'rejected', label: 'Đã từ chối', count: data.counts?.rejected || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" />
          Xét Duyệt Hồ Sơ & Gia Hạn Đối Tác Kinh Doanh (Vendor)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Nhiệp vụ kiểm duyệt thông tin đăng ký gian hàng và gói duy trì kinh doanh theo thẩm quyền được Admin phân công
        </p>
      </div>

      {isRestricted && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Lưu ý về quyền hạn:</strong> Tài khoản của bạn hiện ở chế độ chỉ xem danh sách đối tác. Quyền duyệt/từ chối cần được Quản trị viên kích hoạt trong phân quyền nhân viên.
          </div>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, đại diện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Gian hàng</th>
                <th className="py-2.5 px-3">Gói đăng ký & Phí</th>
                <th className="py-2.5 px-3">Chiết khấu sàn (%)</th>
                <th className="py-2.5 px-3">Hạn hoạt động</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-indigo-500" />
                    Đang tải dữ liệu đối tác...
                  </td>
                </tr>
              ) : data.list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có hồ sơ nào trong mục này.
                  </td>
                </tr>
              ) : (
                data.list.map((vendor) => {
                  const plan = vendor.renewalPlan || vendor.subscriptionPlan || '1_year';
                  const fee = vendor.subscriptionFee || (plan === '2_years' ? 2000000 : 1200000);
                  const isExp = vendor.isExpired;

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          {vendor.storeName || vendor.fullName}
                          <span className="text-[10px] font-mono text-slate-400">({vendor.id.slice(0, 8)})</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {vendor.fullName} • {vendor.phone || 'Chưa có SĐT'}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">
                          {plan === '2_years' ? 'Gói 2 Năm' : 'Gói 1 Năm'}
                        </div>
                        <div className="text-[11px] font-bold text-indigo-600">{formatPrice(fee)}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-emerald-600 flex items-center gap-0.5">
                          <Percent className="w-3 h-3" />
                          {vendor.commissionRate ?? 8.0}%
                        </div>
                        <div className="text-[10px] text-slate-400">/ đơn hoàn tất</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-[11px] font-medium">{formatDate(vendor.subscriptionExpiresAt)}</div>
                        {vendor.daysRemaining !== null && (
                          <div className={`text-[10px] ${isExp ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                            {isExp ? 'Đã quá hạn' : `Còn ${vendor.daysRemaining} ngày`}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {vendor.approvalStatus === 'pending_approval' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Chờ duyệt mới
                          </span>
                        ) : vendor.renewalRequested ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <RefreshCw className="w-3 h-3" /> Chờ duyệt gia hạn
                          </span>
                        ) : vendor.approvalStatus === 'approved' ? (
                          isExp ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" /> Hết hạn (Tạm khóa)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3" /> Đang hoạt động
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <X className="w-3 h-3" /> Đã từ chối
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setDetailModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {!isRestricted && (vendor.approvalStatus === 'pending_approval' || vendor.renewalRequested) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setApprovePlan(vendor.renewalPlan || vendor.subscriptionPlan || '1_year');
                                  setApproveCommission(vendor.commissionRate ?? 8.0);
                                  setApproveNote('');
                                  setApproveModalOpen(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium flex items-center gap-0.5 shadow-xs"
                              >
                                <Check className="w-3 h-3" /> Duyệt
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  setRejectReason('');
                                  setRejectModalOpen(true);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-medium flex items-center gap-0.5 border border-rose-200"
                              >
                                <X className="w-3 h-3" /> Từ chối
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
      </div>

      {/* Approve Modal */}
      {approveModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Phê duyệt đối tác: {selectedVendor.storeName || selectedVendor.fullName}
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div><strong className="text-slate-700 dark:text-slate-200">Đại diện:</strong> {selectedVendor.fullName} ({selectedVendor.email})</div>
              <div><strong className="text-slate-700 dark:text-slate-200">MST:</strong> {selectedVendor.taxId || 'Chưa cung cấp'}</div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">Gói thời hạn</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setApprovePlan('1_year')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    approvePlan === '1_year'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/50 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-slate-900 dark:text-white">Gói 1 Năm</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold">1.200.000 ₫</div>
                </button>
                <button
                  type="button"
                  onClick={() => setApprovePlan('2_years')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    approvePlan === '2_years'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-950/50 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-slate-900 dark:text-white">Gói 2 Năm</div>
                  <div className="text-indigo-600 dark:text-indigo-400 font-bold">2.000.000 ₫</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase mb-1">Chiết khấu sàn (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={approveCommission}
                onChange={(e) => setApproveCommission(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận duyệt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-800">
              Từ chối hồ sơ: {selectedVendor.storeName || selectedVendor.fullName}
            </h3>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Lý do từ chối:</label>
              <textarea
                rows={3}
                placeholder="Nhập lý do từ chối hồ sơ đối tác..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submitting || !rejectReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium disabled:opacity-50"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{selectedVendor.storeName || selectedVendor.fullName}</h3>
                <p className="text-[11px] text-slate-400">ID: {selectedVendor.id}</p>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>

            <div className="space-y-2 text-slate-600">
              <div><strong>Đại diện:</strong> {selectedVendor.fullName}</div>
              <div><strong>Email:</strong> {selectedVendor.email}</div>
              <div><strong>Điện thoại:</strong> {selectedVendor.phone || 'Chưa cung cấp'}</div>
              <div><strong>Mã số thuế:</strong> {selectedVendor.taxId || 'Chưa cung cấp'}</div>
              <div><strong>Địa chỉ:</strong> {selectedVendor.address || 'Chưa cập nhật'}</div>
              <div><strong>Gói kinh doanh:</strong> {selectedVendor.subscriptionPlan === '2_years' ? '2 Năm' : '1 Năm'}</div>
              <div><strong>Phí duy trì:</strong> {formatPrice(selectedVendor.subscriptionFee)}</div>
              <div><strong>Hoa hồng sàn:</strong> {selectedVendor.commissionRate ?? 8}% / đơn giao thành công</div>
              <div><strong>Ngày hết hạn:</strong> {formatDate(selectedVendor.subscriptionExpiresAt)}</div>
              {selectedVendor.approvedBy && (
                <div className="p-2 bg-indigo-50 rounded text-indigo-900">
                  Người duyệt gần nhất: <strong>{selectedVendor.approvedBy}</strong> ({formatDate(selectedVendor.approvedAt)})
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
