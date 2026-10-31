import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Heart,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  Store,
  RefreshCw,
  Search,
  Filter,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award,
  CircleDollarSign,
  UserCheck,
} from 'lucide-react';
import { reportsApi } from '../../api';

export default function CustomerAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [ageFilter, setAgeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportsApi.getCustomerAnalytics({
        page: clientPage,
        itemPerPage: 10,
        ageGroup: ageFilter !== 'all' ? ageFilter : undefined,
        search: search || undefined,
      });
      const result = res.data?.data !== undefined ? res.data.data : res.data;
      if (result) {
        setData(result);
      }
    } catch (err) {
      console.error('Error fetching customer analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [clientPage, ageFilter, search]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    setClientPage(1);
  }, [ageFilter, search]);

  const formatPrice = (val) => {
    if (!val && val !== 0) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const overview = data?.overview;
  const ageGroups = data?.ageGroups || [];
  const ageGroupAnalysis = data?.ageGroupAnalysis || [];
  const topFavoriteVendors = data?.topFavoriteVendors || [];
  const topPurchasedVendors = data?.topPurchasedVendors || [];
  const topCartedVendors = data?.topCartedVendors || [];
  const clientData = data?.clients || { list: [], page: 1, totalPages: 1, totalItems: 0 };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Phân tích Khách hàng & Sở thích Tiêu dùng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thống kê nhân khẩu học (độ tuổi, giới tính) và xu hướng yêu thích, mua sắm sản phẩm theo từng gian hàng từ dữ liệu thực tế hệ thống
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          Làm mới số liệu
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng khách hàng</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-3">
            {overview?.totalClients || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Tài khoản hoạt động trên sàn
          </div>
        </div>

        {/* Dominant Age Group */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Độ tuổi chiếm nhiều nhất</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-3">
            {overview?.dominantGroup?.label || 'Chưa xác định'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Chiếm <strong>{overview?.dominantGroup?.percentage || 0}%</strong> ({overview?.dominantGroup?.count || 0} khách hàng)
          </div>
        </div>

        {/* Average Age */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Độ tuổi trung bình</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-3">
            {overview?.averageAge || 0} <span className="text-lg font-normal text-slate-500">tuổi</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tính từ ngày sinh của {overview?.clientsWithAgeCount ?? 0} / {overview?.totalClients ?? 0} khách hàng
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tỷ lệ giới tính</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3">
            {(overview?.genderStats || []).map((g) => (
              <div key={g.gender}>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{g.count} <span className="text-xs text-slate-400 font-normal">({g.percentage}%)</span></div>
                <div className="text-xs text-slate-500">{g.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Age Distribution & Age Group vs Store Preferences Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Visual Age Bracket Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Phân bố nhóm tuổi
            </h2>
            <span className="text-xs text-slate-400 font-medium">{overview?.totalClients || 0} hồ sơ</span>
          </div>

          <div className="space-y-4 pt-1">
            {ageGroups.map((grp) => {
              const isDominant = grp.key === overview?.dominantGroup?.key;
              return (
                <div key={grp.key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      {grp.label}
                      {isDominant && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 font-bold">
                          Đông nhất
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {grp.count} khách ({grp.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDominant
                          ? 'bg-gradient-to-r from-amber-500 to-indigo-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(grp.percentage, grp.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Cross Analysis - Which stores do each age group view/buy/like? */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                Sở thích Cửa hàng theo từng Độ tuổi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Khách hàng ở từng nhóm tuổi thường xuyên mua sắm và yêu thích gian hàng nào nhất
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-xs uppercase">
                <tr>
                  <th className="py-2.5 px-3">Nhóm độ tuổi</th>
                  <th className="py-2.5 px-3">Quy mô</th>
                  <th className="py-2.5 px-3">Cửa hàng YÊU THÍCH nhất</th>
                  <th className="py-2.5 px-3">Cửa hàng MUA NHIỀU nhất</th>
                  <th className="py-2.5 px-3 text-right">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {ageGroupAnalysis.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.label}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.clientCount}</span>
                      <span className="text-slate-400 ml-1">({item.percentage}%)</span>
                    </td>
                    <td className="py-3 px-3">
                      {item.topFavoriteVendor ? (
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {item.topFavoriteVendor.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold">
                            {item.topFavoriteVendor.count} thích
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có dữ liệu</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {item.topPurchasedVendor ? (
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                            {item.topPurchasedVendor.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold">
                            {item.topPurchasedVendor.count} SP
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có dữ liệu</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatPrice(item.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 2: Top Stores by Favorite vs Purchase vs Cart */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Bảng Xếp Hạng Xu Hướng Sở Thích Khách Hàng Theo Cửa Hàng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xếp hạng các cửa hàng thu hút khách hàng nhiều nhất theo từng hành vi: Lưu yêu thích, Mua hàng thực tế, và Thêm vào giỏ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Top Favorites */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Top Cửa hàng YÊU THÍCH nhất</h3>
              </div>
              <span className="text-xs font-semibold text-rose-500">Lượt thích</span>
            </div>

            <div className="space-y-3">
              {topFavoriteVendors.slice(0, 6).map((v, idx) => (
                <div key={v.vendorId} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{v.storeName}</div>
                      <div className="text-[11px] text-slate-400 truncate">Sản phẩm hot: {v.topProduct || 'Nhiều mẫu'}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-rose-600">{v.favoriteCount}</span>
                    <span className="text-[10px] text-slate-400 block">{v.uniqueClientsCount} khách</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Top Purchases */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Top Cửa hàng MUA NHIỀU nhất</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Doanh thu</span>
            </div>

            <div className="space-y-3">
              {topPurchasedVendors.slice(0, 6).map((v, idx) => (
                <div key={v.vendorId} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{v.storeName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{v.totalUnits} SP • {v.uniqueBuyersCount} khách mua</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{formatPrice(v.totalRevenue)}</span>
                    <span className="text-[10px] text-slate-400">{v.purchaseCount} lượt đặt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Top Carted */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Top Cửa hàng ĐƯỢC QUAN TÂM (Giỏ hàng)</h3>
              </div>
              <span className="text-xs font-semibold text-blue-600">Trong giỏ</span>
            </div>

            <div className="space-y-3">
              {topCartedVendors.slice(0, 6).map((v, idx) => (
                <div key={v.vendorId} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                      idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{v.storeName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{v.uniqueClientsCount} khách đang lưu giỏ</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block">{v.cartCount} SP</span>
                    <span className="text-[10px] text-slate-400">{v.totalItems} số lượng</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Detailed Client Insights Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Chi tiết Hồ sơ Khách hàng & Sở thích Mua sắm
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi tuổi, giới tính, cửa hàng ưa thích và giá trị tiêu dùng của từng khách hàng
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Age Filter Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Độ tuổi:</span>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">Tất cả độ tuổi</option>
                {ageGroups.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label} ({g.count})
                  </option>
                ))}
                {(overview?.unknownAgeCount || 0) > 0 && (
                  <option value="unknown">
                    Chưa xác định ({overview.unknownAgeCount})
                  </option>
                )}
              </select>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm khách hàng, shop hay mua..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-xs">
              <tr>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Giới tính & Ngày sinh</th>
                <th className="py-3 px-4">Tuổi & Nhóm</th>
                <th className="py-3 px-4">Cửa hàng hay mua nhất</th>
                <th className="py-3 px-4 text-center">Yêu thích đã lưu</th>
                <th className="py-3 px-4 text-right">Đơn hàng & Tổng chi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : clientData.list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy khách hàng nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                clientData.list.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{client.fullName}</div>
                      <div className="text-[11px] text-slate-400">{client.email} • {client.phone || 'Chưa có SĐT'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {client.gender === 'male'
                          ? 'Nam'
                          : client.gender === 'female'
                          ? 'Nữ'
                          : client.gender === 'other'
                          ? 'Khác'
                          : client.gender === 'prefer_not_to_say'
                          ? 'Không tiết lộ'
                          : 'Chưa cập nhật'}
                      </div>
                      <div className="text-[11px] text-slate-400">{formatDate(client.dateOfBirth)}</div>
                    </td>

                    <td className="py-3 px-4">
                      {client.age !== null ? (
                        <>
                          <div className="font-bold text-slate-800 dark:text-slate-100">{client.age} tuổi</div>
                          <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-medium mt-0.5">
                            {client.ageGroupLabel}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic">Chưa xác định</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {client.topStorePurchased !== 'Chưa mua' ? (
                        <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                          <Store className="w-3.5 h-3.5 shrink-0" />
                          <span>{client.topStorePurchased}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa có đơn hàng</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold">
                        <Heart className="w-3 h-3 fill-rose-500" />
                        {client.favoritesCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(client.totalSpent)}
                      </div>
                      <div className="text-[11px] text-slate-400">{client.totalOrders} đơn hàng</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Client Pagination */}
        {clientData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Trang {clientData.page} / {clientData.totalPages} (Tổng {clientData.totalItems} khách hàng)
            </span>
            <div className="flex gap-2">
              <button
                disabled={clientPage <= 1}
                onClick={() => setClientPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={clientPage >= clientData.totalPages}
                onClick={() => setClientPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
