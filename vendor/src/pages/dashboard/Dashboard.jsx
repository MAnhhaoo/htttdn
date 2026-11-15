import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  AlertTriangle,
  Loader2,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { getOrderStatusLabel, getOrderStatusBadgeVariant } from '@shared/utils/statusConfig';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { dashboardService } from '../../services/dashboardService';
import { reviewService } from '../../services/reviewService';
import { formatCurrency, formatShortOrderCode } from '../../utils/formatHelpers';
import { Badge } from '../../components/ui';

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h2>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function getOrderNetRatio(order) {
  const discount = Number(order?.discountAmount || 0);
  if (discount <= 0) return 1;
  const netTotal = Number(order?.totalAmount || 0);
  const grossTotal = netTotal + discount;
  return grossTotal > 0 ? netTotal / grossTotal : 1;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const [allProducts, setAllProducts] = useState([]);
  const [allVendorOrderDetails, setAllVendorOrderDetails] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avgRating: '0.0', reviewCount: 0 });

  const currentVendorId = user?.id || user?.userID;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        dashboardService.getProducts(),
        dashboardService.getOrders(),
      ]);

      const products = Array.isArray(productsRes) ? productsRes : productsRes?.list || [];
      const orders = Array.isArray(ordersRes) ? ordersRes : ordersRes?.list || [];
      setAllProducts(products);

      // Chỉ gọi song song tối đa 30 sản phẩm MỘT lần duy nhất cho cả tổng quan & biểu đồ
      const reviewResults = await Promise.allSettled(
        products.slice(0, 30).map((product) => reviewService.getReviewsByProduct(product.id)),
      );

      let totalRating = 0;
      let reviewCount = 0;
      reviewResults.forEach((res) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          res.value.forEach((r) => {
            if (r?.rating) {
              totalRating += Number(r.rating);
              reviewCount += 1;
            }
          });
        }
      });

      setReviewSummary({
        avgRating: reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0',
        reviewCount,
      });

      const vendorDetails = [];
      orders.forEach((order) => {
        const netRatio = getOrderNetRatio(order);
        (order.details || []).forEach((detail) => {
          const matchesVendor =
            !currentVendorId ||
            detail.productVariant?.productColor?.product?.vendorId === currentVendorId ||
            order.vendorOrders?.some((vo) => vo.vendorId === currentVendorId);

          if (matchesVendor) {
            const itemNetRevenue = Math.round(
              (Number(detail.price) || 0) * (Number(detail.quantity) || 1) * netRatio,
            );
            vendorDetails.push({ ...detail, order, itemNetRevenue });
          }
        });
      });

      vendorDetails.sort(
        (a, b) => new Date(b.order?.createdAt || 0) - new Date(a.order?.createdAt || 0),
      );
      setAllVendorOrderDetails(vendorDetails);
    } catch (error) {
      console.error('Lỗi tải dữ liệu tổng quan gian hàng:', error);
    } finally {
      setLoading(false);
    }
  }, [currentVendorId]);

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('miva:dashboard', fetchDashboardData);
    return () => window.removeEventListener('miva:dashboard', fetchDashboardData);
  }, [fetchDashboardData]);

  const { overviewStats, revenueData, topProductsData, recentOrderDetails } = useMemo(() => {
    let totalStock = 0;
    let lowStockCount = 0;
    allProducts.forEach((p) => {
      p.colors?.forEach((c) => {
        c.variants?.forEach((v) => {
          const stock = Number(v.stock) || 0;
          totalStock += stock;
          if (stock > 0 && stock <= 5) lowStockCount += 1;
        });
      });
    });

    const rangeConfig = {
      '7d': { days: 7, type: 'day' },
      '1m': { days: 30, type: 'day' },
      '6m': { months: 6, type: 'month' },
      '1y': { months: 12, type: 'month' },
      all: { months: 12, type: 'month' },
    };
    const config = rangeConfig[timeRange] || rangeConfig['7d'];
    const chartDataMap = new Map();

    if (config.type === 'day') {
      for (let i = config.days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const name =
          config.days === 7
            ? DAY_LABELS[d.getDay()]
            : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        chartDataMap.set(dateStr, { name, revenue: 0, orderIds: new Set() });
      }
    } else {
      for (let i = config.months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const name = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
        chartDataMap.set(monthStr, { name, revenue: 0, orderIds: new Set() });
      }
    }

    let totalRevenueAllTime = 0;
    let periodRevenue = 0;
    const allVendorOrderSet = new Set();
    const pendingOrderSet = new Set();
    const periodOrderSet = new Set();
    const periodCompletedOrderSet = new Set();
    const productSales = {};

    allVendorOrderDetails.forEach((od) => {
      const orderId = od.order?.id;
      const status = od.order?.status;
      allVendorOrderSet.add(orderId);

      if (status === 'pending' || status === 'confirmed' || status === 'processing') {
        pendingOrderSet.add(orderId);
      }
      if (status === 'completed') {
        totalRevenueAllTime += od.itemNetRevenue;
      }

      const orderDate = new Date(od.order?.createdAt || 0);
      const matchKey =
        config.type === 'day'
          ? orderDate.toISOString().split('T')[0]
          : `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;

      if (chartDataMap.has(matchKey)) {
        const bucket = chartDataMap.get(matchKey);
        bucket.orderIds.add(orderId);
        if (status === 'completed') {
          bucket.revenue += od.itemNetRevenue;
        }
      }

      if (timeRange === 'all' || chartDataMap.has(matchKey)) {
        periodOrderSet.add(orderId);
        if (status === 'completed') {
          periodRevenue += od.itemNetRevenue;
          periodCompletedOrderSet.add(orderId);
          const pName = od.productName || 'Sản phẩm khác';
          productSales[pName] = (productSales[pName] || 0) + od.itemNetRevenue;
        }
      }
    });

    const periodOrders = periodOrderSet.size;
    const periodCompleted = periodCompletedOrderSet.size;
    const conversionRate =
      periodOrders > 0 ? ((periodCompleted / periodOrders) * 100).toFixed(1) : '0.0';

    const revSeries = Array.from(chartDataMap.values()).map((d) => ({
      name: d.name,
      revenue: d.revenue,
      orders: d.orderIds.size,
    }));

    const topProds = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return {
      overviewStats: {
        revenue: timeRange === 'all' ? totalRevenueAllTime : periodRevenue,
        totalRevenueAllTime,
        totalOrders: allVendorOrderSet.size,
        periodOrders,
        periodCompleted,
        pendingOrders: pendingOrderSet.size,
        totalProducts: allProducts.length,
        totalStock,
        lowStockCount,
        conversionRate,
      },
      revenueData: revSeries,
      topProductsData: topProds,
      recentOrderDetails: allVendorOrderDetails.slice(0, 8),
    };
  }, [allProducts, allVendorOrderDetails, timeRange]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Tổng quan &amp; Phân tích Doanh thu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Xin chào, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.storeName || user?.fullName || 'Đối tác MIVA'}</span> — theo dõi hiệu quả kinh doanh gian hàng theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kỳ thống kê:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7d">7 ngày qua</option>
            <option value="1m">30 ngày qua</option>
            <option value="6m">6 tháng gần nhất</option>
            <option value="1y">12 tháng gần nhất</option>
            <option value="all">Toàn thời gian</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Doanh thu thuần (Kỳ chọn)"
          value={formatCurrency(overviewStats.revenue)}
          icon={TrendingUp}
          color="bg-[#1A3A2C]"
          subtitle={`${overviewStats.periodCompleted} đơn hoàn tất • Tỷ lệ ${overviewStats.conversionRate}%`}
        />
        <StatCard
          title="Tổng đơn hàng của Shop"
          value={overviewStats.totalOrders}
          icon={ShoppingCart}
          color="bg-[#2A5C4A]"
          subtitle={`${overviewStats.pendingOrders} đơn cần theo dõi / xử lý`}
        />
        <StatCard
          title="Sản phẩm & Tồn kho"
          value={overviewStats.totalProducts}
          icon={Package}
          color="bg-[#35755B]"
          subtitle={`${overviewStats.totalStock} sản phẩm khả dụng trong kho`}
        />
        <StatCard
          title="Đánh giá trung bình"
          value={`${reviewSummary.avgRating} ★`}
          icon={Star}
          color="bg-[#C9A84C]"
          subtitle={`${reviewSummary.reviewCount} lượt đánh giá từ khách hàng`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Biểu đồ Doanh thu &amp; Lượng đơn hàng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Doanh thu tính trên các đơn hàng đã giao thành công (đã trừ chiết khấu khuyến mãi)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? '#223029' : '#e2e8e4'}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a89e' : '#5c6f65', fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a89e' : '#5c6f65', fontSize: 12 }}
                  tickFormatter={(val) =>
                    new Intl.NumberFormat('vi-VN', {
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(val)
                  }
                  width={56}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a89e' : '#5c6f65', fontSize: 12 }}
                  width={36}
                />
                <RechartsTooltip
                  formatter={(val, name) =>
                    name === 'Doanh thu (VNĐ)' ? [formatCurrency(val), name] : [val, name]
                  }
                  contentStyle={{
                    backgroundColor: isDark ? '#15201B' : '#FFFFFF',
                    color: isDark ? '#F0EDE6' : '#1A241E',
                    borderRadius: '10px',
                    border: isDark ? '1px solid #223029' : '1px solid #E2E8E4',
                    boxShadow: '0 4px 12px rgb(0 0 0 / 0.14)',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu (VNĐ)"
                  stroke={isDark ? '#35755B' : '#2A5C4A'}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#35755B' : '#2A5C4A' }}
                  activeDot={{ r: 6, fill: '#1A3A2C', stroke: '#C9A84C', strokeWidth: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Số đơn hàng"
                  stroke="#C9A84C"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#C9A84C' }}
                  activeDot={{ r: 6, fill: '#B08A2E', stroke: '#FBF7EC', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            Top 5 sản phẩm doanh thu cao
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Xếp hạng theo doanh thu thuần trong kỳ đã chọn
          </p>
          <div className="h-72 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductsData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mivaVendorBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={isDark ? '#2A5C4A' : '#1A3A2C'} />
                      <stop offset="65%" stopColor="#35755B" />
                      <stop offset="100%" stopColor="#C9A84C" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={isDark ? '#223029' : '#e2e8e4'}
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#94a89e' : '#5c6f65', fontSize: 11 }}
                    tickFormatter={(val) =>
                      new Intl.NumberFormat('vi-VN', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(val)
                    }
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#cbd5d0' : '#33443c', fontSize: 11 }}
                    width={105}
                  />
                  <RechartsTooltip
                    formatter={(val) => [formatCurrency(val), 'Doanh thu']}
                    cursor={{ fill: isDark ? 'rgba(42, 92, 74, 0.16)' : '#EEF5F1' }}
                    contentStyle={{
                      backgroundColor: isDark ? '#15201B' : '#FFFFFF',
                      color: isDark ? '#F0EDE6' : '#1A241E',
                      borderRadius: '10px',
                      border: isDark ? '1px solid #223029' : '1px solid #E2E8E4',
                      boxShadow: '0 4px 12px rgb(0 0 0 / 0.14)',
                    }}
                  />
                  <Bar
                    dataKey="sales"
                    name="Doanh thu"
                    fill="url(#mivaVendorBarGradient)"
                    radius={[0, 6, 6, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có đơn hàng hoàn tất trong kỳ này
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Đơn hàng gần đây
            </h2>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Xem &amp; Đóng gói tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Mã đơn
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Sản phẩm
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-center">
                    SL
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 text-right">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrderDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      Chưa có đơn hàng nào phát sinh
                    </td>
                  </tr>
                ) : (
                  recentOrderDetails.map((od) => (
                    <tr
                      key={od.id}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <td
                        className="py-3 text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400"
                        title={od.order?.orderCode}
                      >
                        #{formatShortOrderCode(od.order?.orderCode || od.orderId)}
                      </td>
                      <td className="py-3 text-sm text-slate-700 dark:text-slate-300 max-w-[220px] truncate">
                        {od.productName}
                        {od.colorName ? ` - ${od.colorName}` : ''}
                      </td>
                      <td className="py-3 text-sm text-center text-slate-600 dark:text-slate-400">
                        {od.quantity}
                      </td>
                      <td className="py-3 text-sm">
                        <Badge variant={getOrderStatusBadgeVariant(od.order?.status)}>
                          {getOrderStatusLabel(od.order?.status)}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm font-semibold text-right text-slate-800 dark:text-slate-100">
                        {formatCurrency(Number(od.price || 0) * Number(od.quantity || 1))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
            Cảnh báo vận hành
          </h2>
          <div className="space-y-3.5">
            {overviewStats.lowStockCount > 0 ? (
              <Link
                to="/products"
                className="flex items-start p-3.5 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 transition-colors rounded-xl border border-amber-200 dark:border-amber-800/70"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Cảnh báo sắp hết hàng
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Có <strong>{overviewStats.lowStockCount}</strong> biến thể còn từ 5 sản phẩm trở xuống trong kho.
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex items-start p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/70">
                <Package className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Tồn kho ổn định
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Tất cả biến thể đang mở bán đều có số lượng tồn kho an toàn.
                  </p>
                </div>
              </div>
            )}

            <Link
              to="/orders"
              className="flex items-start p-3.5 bg-[#EEF5F1] dark:bg-[#1A3A2C]/30 hover:bg-[#E1EDE6] dark:hover:bg-[#1A3A2C]/45 transition-colors rounded-xl border border-[#2A5C4A]/25 dark:border-[#2A5C4A]/50"
            >
              <ShoppingCart className="w-5 h-5 text-[#1A3A2C] dark:text-[#DEC47E] mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Đơn hàng cần xử lý
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Hiện có <strong>{overviewStats.pendingOrders}</strong> đơn hàng đang chờ xác nhận hoặc đóng gói bàn giao.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
