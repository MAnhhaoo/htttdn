import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Star, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { reviewService } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  
  const [allVendorOrders, setAllVendorOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allReviews, setAllReviews] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [productsRes, orders] = await Promise.all([
          dashboardService.getProducts(),
          dashboardService.getOrders()
        ]);
        
        const products = productsRes.list || [];
        setAllProducts(products);

        // Fetch reviews for rating calculation
        let reviewsData = [];
        for (const product of products) {
          const prodReviews = await reviewService.getReviewsByProduct(product.id);
          reviewsData = [...reviewsData, ...(prodReviews || [])];
        }
        setAllReviews(reviewsData);

        const vendorOrderDetails = [];
        orders.forEach(order => {
          order.details.forEach(detail => {
            if (detail.productVariant?.productColor?.product?.vendorId === user?.id) {
              vendorOrderDetails.push({ ...detail, order });
            }
          });
        });
        setAllVendorOrders(vendorOrderDetails);

      } catch (error) {
        console.error('Error fetching analytics data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  const { stats, revenueData, topProductsData } = useMemo(() => {
    if (!allProducts.length && !allVendorOrders.length) {
      return {
        stats: { revenue: 0, totalOrders: 0, avgRating: 0, conversionRate: 0 },
        revenueData: [],
        topProductsData: []
      };
    }

    // --- Calculate overall KPIs ---
    let revenue = 0;
    const vendorOrderSet = new Set();
    const completedOrderSet = new Set();
    
    allVendorOrders.forEach(od => {
      vendorOrderSet.add(od.order.id);
      if (od.order.status === 'completed') {
        revenue += Number(od.price) * od.quantity;
        completedOrderSet.add(od.order.id);
      }
    });

    const totalOrders = vendorOrderSet.size;
    const completedOrders = completedOrderSet.size;

    let totalRating = 0;
    allReviews.forEach(r => {
      if (r.rating) totalRating += r.rating;
    });
    const avgRating = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 0;
    const conversionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;

    const statsData = { revenue, totalOrders, avgRating, conversionRate };

    // --- Calculate Chart Data based on timeRange ---
    const rangeConfig = {
      '7d': { days: 7, type: 'day' },
      '1m': { days: 30, type: 'day' },
      '6m': { months: 6, type: 'month' },
      '1y': { months: 12, type: 'month' }
    };
    const config = rangeConfig[timeRange];
    const chartDataMap = new Map();
    
    if (config.type === 'day') {
      for (let i = config.days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const name = config.days === 7 ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] : `${d.getDate()}/${d.getMonth()+1}`;
        chartDataMap.set(dateStr, { name, revenue: 0, orderIds: new Set(), matchKey: dateStr });
      }
    } else {
      for (let i = config.months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const name = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
        chartDataMap.set(monthStr, { name, revenue: 0, orderIds: new Set(), matchKey: monthStr });
      }
    }

    allVendorOrders.forEach(od => {
      const orderDate = new Date(od.order.createdAt);
      let matchKey = '';
      if (config.type === 'day') {
        matchKey = orderDate.toISOString().split('T')[0];
      } else {
        matchKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      }

      if (chartDataMap.has(matchKey)) {
        const dayData = chartDataMap.get(matchKey);
        dayData.orderIds.add(od.order.id);
        if (od.order.status === 'completed') {
          dayData.revenue += Number(od.price) * od.quantity;
        }
      }
    });

    const revData = Array.from(chartDataMap.values()).map(d => ({
      name: d.name,
      revenue: d.revenue,
      orders: d.orderIds.size
    }));

    // --- Calculate Top Products Data ---
    const productSales = {};
    allVendorOrders.forEach(od => {
      if (od.order.status === 'completed') {
        const pName = od.productName || 'Unknown Product';
        if (!productSales[pName]) productSales[pName] = 0;
        productSales[pName] += Number(od.price) * od.quantity;
      }
    });

    const topProds = Object.keys(productSales)
      .map(name => ({ name, sales: productSales[name] }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
      
    return {
      stats: statsData,
      revenueData: revData,
      topProductsData: topProds
    };
  }, [allProducts, allVendorOrders, allReviews, timeRange]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Track your store's sales and performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+12%' },
          { title: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+8%' },
          { title: 'Average Rating', value: stats.avgRating, icon: Star, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+0.2' },
          { title: 'Conversion Rate', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', trend: '+0.5%' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.value}</h3>
              <p className="text-xs text-green-600 mt-1 font-medium">{card.trend} this week</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Revenue & Orders</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="7d">7 ngày qua</option>
              <option value="1m">1 tháng trước</option>
              <option value="6m">6 tháng trước</option>
              <option value="1y">1 năm trước</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} 
                  tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)} 
                  width={60}
                />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={10} width={40} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VND)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Top Selling Products</h3>
          <div className="h-80 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} 
                    tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)} 
                  />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={100} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" name="Doanh thu (VND)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
