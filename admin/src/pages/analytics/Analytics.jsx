import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Users, TrendingUp, Loader2 } from 'lucide-react';
import { usersApi, ordersApi } from '../../api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeVendors: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topVendorsData, setTopVendorsData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [ordersRes, usersRes, vendorsRes] = await Promise.allSettled([
          ordersApi.getOrders({ page: 1, itemPerPage: 10000 }),
          usersApi.getUsers({ page: 1, itemPerPage: 1, role: 'customer' }),
          usersApi.getUsers({ page: 1, itemPerPage: 1, role: 'vendor' })
        ]);

        const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data.list || []) : [];
        const activeUsers = usersRes.status === 'fulfilled' ? (usersRes.value.data.totalItems || 0) : 0;
        const activeVendors = vendorsRes.status === 'fulfilled' ? (vendorsRes.value.data.totalItems || 0) : 0;

        let totalRevenue = 0;
        const vendorSales = {};
        const dailyStats = new Map();

        // 7 days overview
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
          dailyStats.set(dateStr, { name, revenue: 0, orders: 0, matchKey: dateStr });
        }

        orders.forEach(order => {
          if (order.status === 'completed') {
            totalRevenue += Number(order.totalAmount || 0);

            // Vendor sales based on order details
            if (order.details) {
              order.details.forEach(detail => {
                const vendorId = detail.productVariant?.productColor?.product?.vendor?.fullName || 'Unknown Vendor';
                if (!vendorSales[vendorId]) vendorSales[vendorId] = 0;
                vendorSales[vendorId] += Number(detail.price) * detail.quantity;
              });
            }

            // Daily chart
            const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
            if (dailyStats.has(orderDateStr)) {
              const dayData = dailyStats.get(orderDateStr);
              dayData.revenue += Number(order.totalAmount || 0);
              dayData.orders += 1;
            }
          }
        });

        const revData = Array.from(dailyStats.values());
        
        const topVendors = Object.keys(vendorSales)
          .map(name => ({ name, sales: vendorSales[name] }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        setStats({
          revenue: totalRevenue,
          totalOrders: orders.length,
          activeUsers,
          activeVendors
        });
        setRevenueData(revData);
        setTopVendorsData(topVendors);

      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

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
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Platform Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor your entire marketplace performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: '+14%' },
          { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+5%' },
          { title: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+12%' },
          { title: 'Active Vendors', value: stats.activeVendors.toLocaleString(), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+2%' },
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
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)} width={60} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={10} width={40} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VND)" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Đơn hàng" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors Chart */}
        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Top Vendors</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(val)} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={100} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sales" name="Doanh thu (VND)" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
