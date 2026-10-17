import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Store,
  DollarSign,
  Package,
  ShoppingCart,
  Ticket,
  Calendar,
  Percent,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { usersApi, vendorsApi } from '../../api';
import { Button, Input, Select, Badge, Modal } from '../../components/ui';

export default function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Vendor Detail Modal State
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, itemPerPage: 10, role: 'vendor' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await usersApi.getUsers(params);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      setVendors(data.list || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      await usersApi.updateUser(vendorId, { status: newStatus });
      fetchVendors();
      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleOpenDetail = async (vendor) => {
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setSelectedVendor(vendor);
    try {
      const res = await vendorsApi.getVendor(vendor.id);
      const enriched = res.data?.data !== undefined ? res.data.data : res.data;
      if (enriched) {
        setSelectedVendor(enriched);
      }
    } catch (err) {
      console.error('Error fetching vendor full details:', err);
    } finally {
      setLoadingDetail(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Store className="w-7 h-7 text-indigo-600" />
            Quản lý Đối tác Cửa hàng (Vendors)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tổng số {totalItems} cửa hàng đối tác đang liên kết trên nền tảng thương mại điện tử MIVA
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Tìm kiếm theo mã cửa hàng (VND-...), tên shop, email, MST..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'active', label: 'Active (Hoạt động)' },
              { value: 'inactive', label: 'Inactive (Đình chỉ / Tạm khóa)' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-56"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="ml-2 text-slate-500">Đang tải danh sách vendor...</span>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              Không tìm thấy cửa hàng đối tác nào phù hợp.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Mã cửa hàng</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Cửa hàng / Đối tác</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Email liên hệ</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Số điện thoại</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetail(vendor)}
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenDetail(vendor)}
                        className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                      >
                        {vendor.vendorCode || vendor.storeCode || `VND-${vendor.id.slice(0, 8).toUpperCase()}`}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mr-3 font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {vendor.avatarUrl ? (
                            <img src={vendor.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            (vendor.storeName || vendor.fullName)?.charAt(0) || 'V'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors">
                            {vendor.storeName || vendor.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {vendor.storeName && vendor.fullName !== vendor.storeName
                              ? `Chủ: ${vendor.fullName}`
                              : vendor.taxId
                              ? `MST: ${vendor.taxId}`
                              : 'Đối tác MIVA'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{vendor.email}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{vendor.phone || '—'}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={getStatusBadge(vendor.status)}>
                        {vendor.status?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          onClick={() => handleOpenDetail(vendor)}
                          title="Xem chi tiết hồ sơ & kinh doanh"
                        />
                        {vendor.status === 'inactive' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={CheckCircle}
                            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleStatusChange(vendor.id, 'active')}
                            title="Kích hoạt gian hàng"
                          />
                        )}
                        {vendor.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={XCircle}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => handleStatusChange(vendor.id, 'inactive')}
                            title="Đình chỉ / Tạm khóa"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trang {page} / {totalPages} (Tổng số {totalItems} vendor)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Vendor Detail Modal */}
      {detailModalOpen && selectedVendor && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Chi tiết Hồ sơ Gian hàng: ${selectedVendor.storeName || selectedVendor.fullName}`}
        >
          {loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span>Đang tải thông tin chi tiết và số liệu kinh doanh...</span>
            </div>
          ) : (
            <div className="space-y-6 text-sm">
              {/* Header profile banner */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                  {selectedVendor.avatarUrl ? (
                    <img src={selectedVendor.avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Store className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                      {selectedVendor.storeName || selectedVendor.fullName}
                    </h3>
                    <Badge variant={getStatusBadge(selectedVendor.status)}>
                      {selectedVendor.status?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                      ID: {selectedVendor.id}
                    </span>
                    <span>MST: <strong className="text-slate-600 dark:text-slate-300">{selectedVendor.taxId || 'Chưa có'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Real Performance Metrics Strip (100% Real from dataset) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Thống kê kinh doanh thực tế (Từ hệ thống)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Tổng doanh số
                    </div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(selectedVendor.totalRevenue)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                      <Package className="w-3.5 h-3.5 text-indigo-500" /> Sản phẩm bán
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {selectedVendor.stats?.productCount ?? '—'} <span className="text-xs font-normal text-slate-400">SP</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                      <ShoppingCart className="w-3.5 h-3.5 text-blue-500" /> Đơn của shop
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {selectedVendor.stats?.orderCount ?? '—'} <span className="text-xs font-normal text-slate-400">đơn</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="text-slate-400 text-xs flex items-center gap-1 mb-1">
                      <Ticket className="w-3.5 h-3.5 text-amber-500" /> Khuyến mãi
                    </div>
                    <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {selectedVendor.stats?.voucherCount ?? '—'} <span className="text-xs font-normal text-slate-400">mã</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription & Commission Card */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" /> Gói kinh doanh & Phí sàn
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {selectedVendor.subscriptionPlan === '2_years' ? 'Gói Tiêu chuẩn 2 Năm' : 'Gói Tiêu chuẩn 1 Năm'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Phí gói duy trì:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatPrice(selectedVendor.subscriptionFee || (selectedVendor.subscriptionPlan === '2_years' ? 2000000 : 1200000))}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Chiết khấu sàn:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Percent className="w-3 h-3" />
                      {selectedVendor.commissionRate || 8.0}% / đơn hoàn tất
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Thời hạn kinh doanh:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatDate(selectedVendor.subscriptionExpiresAt)}
                    </strong>
                    {selectedVendor.daysRemaining !== null && (
                      <span className={`block text-[10px] mt-0.5 ${selectedVendor.isExpired ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                        {selectedVendor.isExpired ? 'Đã quá hạn (Tạm khóa)' : `Còn ${selectedVendor.daysRemaining} ngày`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner and Legal Information */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Thông tin Pháp lý & Liên hệ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Người đại diện</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block">{selectedVendor.fullName}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email đăng nhập</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block">{selectedVendor.email}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Số điện thoại</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block">{selectedVendor.phone || 'Chưa cập nhật'}</strong>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ngày gia nhập sàn</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm block">{formatDate(selectedVendor.createdAt)}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mt-3 text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 mb-1"><MapPin className="w-3.5 h-3.5" /> Địa chỉ kinh doanh / kho lấy hàng</span>
                  <div className="font-medium text-slate-700 dark:text-slate-300">{selectedVendor.address || 'Chưa cập nhật địa chỉ'}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  {selectedVendor.status === 'active' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleStatusChange(selectedVendor.id, 'inactive')}
                    >
                      Đình chỉ gian hàng
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleStatusChange(selectedVendor.id, 'active')}
                    >
                      Kích hoạt gian hàng
                    </Button>
                  )}
                </div>

                <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
