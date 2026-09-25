import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Star, TrendingUp } from 'lucide-react';

const revenueData = [
  { name: 'Mon', revenue: 1200, orders: 10 },
  { name: 'Tue', revenue: 1500, orders: 12 },
  { name: 'Wed', revenue: 900, orders: 8 },
  { name: 'Thu', revenue: 1800, orders: 15 },
  { name: 'Fri', revenue: 2500, orders: 20 },
  { name: 'Sat', revenue: 3200, orders: 28 },
  { name: 'Sun', revenue: 2800, orders: 22 },
];

const topProductsData = [
  { name: 'Nike AF1', sales: 4500 },
  { name: 'Adidas Yeezy', sales: 3200 },
  { name: 'Puma RS-X', sales: 2100 },
  { name: 'Converse CX', sales: 1500 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Track your store's sales and performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: '$13,900', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100', trend: '+12%' },
          { title: 'Total Orders', value: '115', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+8%' },
          { title: 'Average Rating', value: '4.8', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100', trend: '+0.2' },
          { title: 'Conversion Rate', value: '3.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', trend: '+0.5%' },
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
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Revenue & Orders</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sales" name="Sales ($)" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
