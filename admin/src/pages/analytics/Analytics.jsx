import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, Loader2, Package, 
  Settings, Sliders, RefreshCw, Check, Percent, Building2, Store, HelpCircle,
  ArrowUpRight, AlertCircle, Sparkles, Coins, Calendar, Wallet, CheckCircle2,
  XCircle, Award
} from 'lucide-react';
import { reportsApi } from '../../api';
import { Button, Input, Modal, Badge } from '../../components/ui';

// Cấu hình tài chính mặc định
const DEFAULT_FINANCE_CONFIG = {
  vendorRegistrationFee: 2000000, // 2,000,000 VND / vendor đăng ký
  commissionTaxRate: 8,           // 8% thuế / hoa hồng sàn trên mỗi đơn hàng hoàn tất
};

const STORAGE_KEY = 'admin_platform_finance_config';

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  // Period controls: 'all' | 'custom' | 'year' | 'quarter' | 'month' | 'week'
  const [period, setPeriod] = useState('all'); 
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedQuarter, setSelectedQuarter] = useState(4);
  const [availableYears, setAvailableYears] = useState([2026, 2025]);
  const [startDate, setStartDate] = useState('2026-09-19');
  const [endDate, setEndDate] = useState('2026-09-29');

  // Cấu hình tài chính (Phí đăng ký & Thuế hoa hồng)
  const [financeConfig, setFinanceConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Lỗi đọc cấu hình tài chính:', e);
    }
    return DEFAULT_FINANCE_CONFIG;
  });

  // Modal cấu hình
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempFee, setTempFee] = useState(financeConfig.vendorRegistrationFee);
  const [tempRate, setTempRate] = useState(financeConfig.commissionTaxRate);
  const [configSuccessMsg, setConfigSuccessMsg] = useState('');

  // Backend Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    summary: {
      totalGmv: 0,
      totalCashIn: 0,
      totalAdminRevenue: 0,
      vendorFeeRevenue: 0,
      allTimeVendorFeeRevenue: 0,
      newVendorsInPeriod: 0,
      orderTaxRevenue: 0,
      vendorNetRevenue: 0,
      totalOrdersCount: 0,
      totalSystemOrdersCount: 0,
      completedOrdersCount: 0,
      cancelledOrdersCount: 0,
      conversionRate: 0,
      activeVendorsCount: 0,
      activeClientsCount: 0,
      totalClientsCount: 0,
      totalProductsCount: 0,
    },
    chartData: [],
    topVendors: [],
    topProducts: [],
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getAnalytics({
        period,
        year: selectedYear,
        month: selectedMonth,
        quarter: selectedQuarter,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
        vendorRegistrationFee: financeConfig.vendorRegistrationFee,
        commissionTaxRate: financeConfig.commissionTaxRate,
      });

      if (res.data) {
        setAnalyticsData(res.data);
        if (res.data.availableYears && res.data.availableYears.length > 0) {
          setAvailableYears(res.data.availableYears);
        }
      }
    } catch (err) {
      console.error('Error fetching analytics from backend:', err);
    } finally {
      setLoading(false);
    }
  }, [period, selectedYear, selectedMonth, selectedQuarter, startDate, endDate, financeConfig]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Lưu cấu hình phí & thuế
  const handleSaveConfig = () => {
    const newConfig = {
      vendorRegistrationFee: Math.max(0, Number(tempFee) || 0),
      commissionTaxRate: Math.max(0, Math.min(100, Number(tempRate) || 0)),
    };
    setFinanceConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
    setConfigSuccessMsg('Đã cập nhật cấu hình phí & thuế thành công!');
    setTimeout(() => {
      setConfigSuccessMsg('');
      setIsConfigOpen(false);
    }, 1000);
  };

  const handleResetDefault = () => {
    setTempFee(DEFAULT_FINANCE_CONFIG.vendorRegistrationFee);
    setTempRate(DEFAULT_FINANCE_CONFIG.commissionTaxRate);
  };

  const openConfigModal = () => {
    setTempFee(financeConfig.vendorRegistrationFee);
    setTempRate(financeConfig.commissionTaxRate);
    setConfigSuccessMsg('');
    setIsConfigOpen(true);
  };

  const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const { summary, chartData, topVendors, topProducts } = analyticsData;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Phân Tích Sàn Giao Dịch &amp; Tài Chính
            <Badge variant="outline" className="text-xs font-normal border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-950 dark:text-indigo-300">
              Admin Portal
            </Badge>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Phân tích đa chu kỳ theo Tuần, Tháng, Quý, Năm • Bóc tách Thực thu sàn vs Tổng GMV vs Doanh thu Admin
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            onClick={fetchAnalytics}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>

          <Button 
            onClick={openConfigModal}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
          >
            <Sliders className="w-4 h-4" />
            Cấu hình Phí &amp; Thuế Sàn
          </Button>
        </div>
      </div>

      {/* Period Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Kỳ phân tích:
          </span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { id: 'all', label: 'Toàn Bộ' },
              { id: 'custom', label: 'Tùy Chọn Ngày' },
              { id: 'year', label: 'Theo Năm' },
              { id: 'quarter', label: 'Theo Quý' },
              { id: 'month', label: 'Theo Tháng' },
              { id: 'week', label: 'Theo Tuần' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  period === p.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Period Dropdowns & Custom Date Inputs */}
        <div className="flex flex-wrap items-center gap-3">
          {period === 'custom' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Từ:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">Đến:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Quick preset buttons */}
              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('2026-09-19');
                    setEndDate('2026-09-29');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition border border-indigo-200 dark:border-indigo-800"
                  title="Xem từ ngày 19 tới 29 của tháng trước"
                >
                  ⚡ 19 - 29 Tháng trước
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('2026-10-01');
                    setEndDate('2026-10-14');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium transition"
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('2026-09-01');
                    setEndDate('2026-09-30');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium transition"
                >
                  Trọn tháng 9
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('2026-10-07');
                    setEndDate('2026-10-14');
                  }}
                  className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-medium transition"
                >
                  7 ngày qua
                </button>
              </div>
            </div>
          )}

          {period !== 'all' && period !== 'custom' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Năm:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === 'month' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Tháng:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {period === 'quarter' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Quý:</span>
              <select
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>Quý 1 (T1 - T3)</option>
                <option value={2}>Quý 2 (T4 - T6)</option>
                <option value={3}>Quý 3 (T7 - T9)</option>
                <option value={4}>Quý 4 (T10 - T12)</option>
              </select>
            </div>
          )}

          <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-700 text-xs px-2.5 py-1">
            Đang lọc: {
              period === 'custom'
                ? `Từ ${startDate} đến ${endDate} (${summary.totalOrdersCount} đơn)`
                : period === 'year'
                ? `Cả năm ${selectedYear} (${summary.totalOrdersCount} / ${summary.totalSystemOrdersCount || 800} đơn toàn sàn)`
                : period === 'quarter'
                ? `Quý ${selectedQuarter}/${selectedYear} (${summary.totalOrdersCount} đơn)`
                : period === 'month'
                ? `Tháng ${selectedMonth}/${selectedYear} (${summary.totalOrdersCount} đơn)`
                : period === 'week'
                ? `Tuần gần nhất (${selectedYear})`
                : `Toàn bộ thời gian (${summary.totalOrdersCount || 800} đơn)`
            }
          </Badge>
        </div>
      </div>

      {/* Admin Revenue Breakdown Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-900/50">
        <div className="absolute -right-8 -top-8 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-indigo-900/60 gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-sm font-medium mb-1">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>DOANH THU THỰC TẾ CỦA ADMIN SÀN (PLATFORM REVENUE)</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {formatVND(summary.totalAdminRevenue)}
              </h2>
              <p className="text-xs text-indigo-200/70 mt-1">
                {summary.vendorFeeRevenue > 0
                  ? `Doanh thu nền tảng = Phí ĐK vendor (${formatVND(summary.vendorFeeRevenue)}) + Thuế sàn ${financeConfig.commissionTaxRate}% (${formatVND(summary.orderTaxRevenue)})`
                  : `Doanh thu sàn trong kỳ = Thuế sàn ${financeConfig.commissionTaxRate}% trên đơn hoàn tất (${formatVND(summary.orderTaxRevenue)}) • Lũy kế phí ĐK toàn sàn: ${formatVND(summary.allTimeVendorFeeRevenue || 50000000)}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openConfigModal}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur text-xs"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Đổi mức phí &amp; thuế
              </Button>
            </div>
          </div>

          {/* 4 Pillars Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-200 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  Phí Đăng Ký Kinh Doanh
                </span>
                <Badge variant="outline" className="border-amber-400/40 text-amber-300 text-[10px] bg-amber-500/10">
                  {formatVND(financeConfig.vendorRegistrationFee)} / shop
                </Badge>
              </div>
              <p className="text-xl font-bold text-white">{formatVND(summary.vendorFeeRevenue)}</p>
              <p className="text-xs text-slate-400 mt-1">
                {period === 'all'
                  ? `${summary.activeVendorsCount} vendor hoạt động đã nộp phí`
                  : `${summary.newVendorsInPeriod || 0} vendor mới trong kỳ (Lũy kế: ${summary.activeVendorsCount} shop)`}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-200 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  Thuế / Hoa Hồng Sàn
                </span>
                <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 text-[10px] bg-emerald-500/10">
                  {financeConfig.commissionTaxRate}% mỗi đơn
                </Badge>
              </div>
              <p className="text-xl font-bold text-white">{formatVND(summary.orderTaxRevenue)}</p>
              <p className="text-xs text-slate-400 mt-1">
                Trích từ {summary.completedOrdersCount} đơn hoàn tất trong kỳ
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-200 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                  Tổng GMV Giao Dịch
                </span>
                <Badge variant="outline" className="border-sky-400/40 text-sky-300 text-[10px] bg-sky-500/10">
                  Hàng hóa
                </Badge>
              </div>
              <p className="text-xl font-bold text-white">{formatVND(summary.totalGmv)}</p>
              <p className="text-xs text-slate-400 mt-1">
                Tổng giá trị đơn hàng hoàn tất trong kỳ
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-indigo-200 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-purple-400" />
                  Thực Thu Sàn (Cash-in)
                </span>
                <Badge variant="outline" className="border-purple-400/40 text-purple-300 text-[10px] bg-purple-500/10">
                  Tiền về ví sàn
                </Badge>
              </div>
              <p className="text-xl font-bold text-white">{formatVND(summary.totalCashIn)}</p>
              <p className="text-xs text-slate-400 mt-1">
                Online đã thanh toán + COD giao thành công
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { 
            title: 'Doanh Thu Sàn', 
            value: formatVND(summary.totalAdminRevenue), 
            sub: summary.vendorFeeRevenue > 0 ? `Phí ĐK + ${financeConfig.commissionTaxRate}% thuế` : `Thuế sàn ${financeConfig.commissionTaxRate}%`, 
            icon: DollarSign, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-100 dark:bg-emerald-950/60' 
          },
          { 
            title: 'Thu Nhập Vendor', 
            value: formatVND(summary.vendorNetRevenue), 
            sub: 'GMV trừ thuế sàn', 
            icon: Building2, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-100 dark:bg-indigo-950/60' 
          },
          { 
            title: 'Tổng Sản Phẩm', 
            value: (summary.totalProductsCount || 0).toLocaleString(), 
            sub: 'Đang lưu hành trên sàn', 
            icon: Package, 
            color: 'text-purple-600', 
            bg: 'bg-purple-100 dark:bg-purple-950/60' 
          },
          { 
            title: 'Tổng Đơn Hàng', 
            value: (summary.totalOrdersCount || 0).toLocaleString(), 
            sub: summary.totalSystemOrdersCount && summary.totalOrdersCount !== summary.totalSystemOrdersCount 
              ? `${summary.completedOrdersCount} hoàn tất / ${summary.totalSystemOrdersCount} đơn toàn sàn` 
              : `${summary.completedOrdersCount} đơn hoàn tất`, 
            icon: ShoppingBag, 
            color: 'text-blue-600', 
            bg: 'bg-blue-100 dark:bg-blue-950/60' 
          },
          { 
            title: 'Khách Hàng', 
            value: (summary.activeClientsCount || 0).toLocaleString(), 
            sub: `${summary.activeClientsCount} hoạt động / ${summary.totalClientsCount || 120} tài khoản`, 
            icon: Users, 
            color: 'text-cyan-600', 
            bg: 'bg-cyan-100 dark:bg-cyan-950/60' 
          },
          { 
            title: 'Tỷ Lệ Hoàn Tất', 
            value: `${summary.conversionRate}%`, 
            sub: `${summary.cancelledOrdersCount} đơn bị hủy`, 
            icon: CheckCircle2, 
            color: 'text-amber-600', 
            bg: 'bg-amber-100 dark:bg-amber-950/60' 
          },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 transition-colors p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">{card.value}</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Tax Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {period === 'custom'
                  ? `Biểu Đồ Tài Chính & Dòng Tiền Theo Ngày (${startDate} - ${endDate})`
                  : 'Biểu Đồ Tài Chính & Dòng Tiền Theo Kỳ'}
              </h3>
              <p className="text-xs text-slate-400">
                So sánh Thực thu sàn (Cash-in), GMV hàng hóa, và Doanh thu thuế Admin ({financeConfig.commissionTaxRate}%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 text-xs">
                Thuế sàn: {financeConfig.commissionTaxRate}%
              </Badge>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCashIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }} 
                  dx={-10} 
                  tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)} 
                  width={65} 
                />
                <RechartsTooltip 
                  formatter={(val, name) => [formatVND(val), name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="gmv" 
                  name="Tổng GMV Hàng Hóa" 
                  stroke="#6366f1" 
                  fillOpacity={1}
                  fill="url(#colorGmv)"
                  strokeWidth={2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="cashIn" 
                  name="Thực Thu Sàn (Cash-in)" 
                  stroke="#a855f7" 
                  fillOpacity={1}
                  fill="url(#colorCashIn)"
                  strokeWidth={2} 
                />
                <Area 
                  type="monotone" 
                  dataKey="adminTax" 
                  name={`Thuế sàn thu được (${financeConfig.commissionTaxRate}%)`} 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#colorTax)"
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Breakdown Chart */}
        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {period === 'custom' ? 'Đơn Hoàn Tất vs Hủy Theo Ngày' : 'Đơn Hoàn Tất vs Hủy'}
              </h3>
              <p className="text-xs text-slate-400">
                Số lượng đơn hàng phân theo mốc thời gian
              </p>
            </div>
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={30} />
                <RechartsTooltip 
                  formatter={(val, name) => [`${val} đơn`, name]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend />
                <Bar dataKey="completedOrders" name="Hoàn tất" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelledOrders" name="Bị hủy" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leaderboards: Top Vendors & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600" />
                Top 5 Gian Hàng Đạt Doanh Số Cao Nhất
              </h3>
              <p className="text-xs text-slate-400">
                Thống kê theo GMV hoàn tất và số thuế đã nộp về sàn
              </p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          {topVendors.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Store className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              Chưa có dữ liệu giao dịch trong kỳ đã chọn
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="pb-2.5">Gian hàng</th>
                    <th className="pb-2.5 text-center">Đơn hàng</th>
                    <th className="pb-2.5 text-right">Doanh số GMV</th>
                    <th className="pb-2.5 text-right">Thuế nộp sàn ({financeConfig.commissionTaxRate}%)</th>
                    <th className="pb-2.5 text-right">Thực nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topVendors.map((v, i) => (
                    <tr key={v.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        {v.name}
                      </td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 font-semibold">
                        {v.orderCount}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {formatVND(v.sales)}
                      </td>
                      <td className="py-3 text-right font-semibold text-emerald-600">
                        {formatVND(v.tax)}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatVND(v.netEarnings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Top 5 Sản Phẩm Bán Chạy Nhất
              </h3>
              <p className="text-xs text-slate-400">
                Thống kê theo số lượng sản phẩm bán ra và tổng doanh thu
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          {topProducts.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Package className="w-10 h-10 mb-2 stroke-1 text-slate-300" />
              Chưa có dữ liệu sản phẩm trong kỳ đã chọn
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <th className="pb-2.5">Sản phẩm</th>
                    <th className="pb-2.5">Danh mục</th>
                    <th className="pb-2.5 text-center">Đã bán</th>
                    <th className="pb-2.5 text-right">Doanh số</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topProducts.map((p, i) => (
                    <tr key={p.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 max-w-[200px] truncate">
                        <span className="w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 font-bold flex items-center justify-center text-[10px]">
                          {i + 1}
                        </span>
                        <span className="truncate">{p.name}</span>
                      </td>
                      <td className="py-3 text-slate-500">
                        <Badge variant="outline" className="text-[10px] py-0 px-2">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-800 dark:text-slate-100">
                        {p.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-semibold text-indigo-600">
                        {formatVND(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tùy chỉnh Phí Đăng ký & Thuế Sàn */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Cấu hình Doanh Thu Sàn (Phí Đăng Ký & Thuế Hoa Hồng)"
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefault}
              className="text-slate-500 hover:text-slate-700"
            >
              Khôi phục mặc định
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfigOpen(false)}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSaveConfig}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Lưu cấu hình
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          {configSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {configSuccessMsg}
            </div>
          )}

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs text-indigo-800 dark:text-indigo-300">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Công thức doanh thu sàn Admin:
            </p>
            <p>
              <strong>Doanh thu Admin</strong> = (Số Vendor × Phí Đăng Ký) + (Tổng GMV Đơn Thành Công × % Thuế Sàn)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phí Đăng Ký Kinh Doanh Của Vendor (VNĐ / Shop)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Khoản phí cố định mỗi Vendor phải đóng để đăng ký mở gian hàng và duy trì kinh doanh trên sàn.
            </p>
            <Input
              type="number"
              min="0"
              step="100000"
              value={tempFee}
              onChange={(e) => setTempFee(e.target.value)}
              placeholder="VD: 2000000"
            />
            <p className="text-xs text-indigo-600 font-medium mt-1">
              Xem trước: {formatVND(Number(tempFee) || 0)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tỷ Lệ Thuế / Hoa Hồng Sàn Trên Mỗi Đơn Hàng (%)
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Phần trăm thuế mà sàn trích thu trên giá trị mỗi đơn hàng hoàn tất của vendor (mặc định 8%).
            </p>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                placeholder="VD: 8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                %
              </span>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Dự phóng Doanh thu sàn với {summary.activeVendorsCount} Vendor hiện tại:
            </h4>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Thu từ phí đăng ký ({summary.activeVendorsCount} vendor):</span>
              <strong className="text-slate-800 dark:text-slate-100">{formatVND(summary.activeVendorsCount * (Number(tempFee) || 0))}</strong>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
              <span>Thu từ thuế {tempRate}% trên GMV ({formatVND(summary.totalGmv)}):</span>
              <strong className="text-slate-800 dark:text-slate-100">{formatVND((summary.totalGmv * (Number(tempRate) || 0)) / 100)}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
              <strong className="text-indigo-600">Tổng doanh thu dự kiến:</strong>
              <strong className="text-indigo-600">
                {formatVND(
                  summary.activeVendorsCount * (Number(tempFee) || 0) +
                  (summary.totalGmv * (Number(tempRate) || 0)) / 100
                )}
              </strong>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
