import { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Link } from 'react-router-dom';

function StatCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</h2>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    avgRating: 0,
    reviewCount: 0
  });
  const [recentOrderDetails, setRecentOrderDetails] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, orders] = await Promise.all([
          dashboardService.getProducts(),
          dashboardService.getOrders()
        ]);
        
        const products = productsRes.list || [];
        
        // Product stats
        let totalStock = 0;
        let lowStockCount = 0;
        products.forEach(p => {
          p.colors?.forEach(c => {
            c.variants?.forEach(v => {
              totalStock += v.stock;
              if (v.stock > 0 && v.stock <= 5) lowStockCount++;
            });
          });
        });

        // Order stats
        const completedOrders = orders.filter(o => o.status === 'completed');
        const pendingOrders = orders.filter(o => o.status === 'pending');
        
        // Calculate revenue from completed orders that belong to this vendor
        // Note: The /orders/vendor/mine returns full orders. We need to sum up the order details that belong to this vendor.
        let revenue = 0;
        let allOrderDetails = [];
        
        orders.forEach(order => {
          order.details.forEach(detail => {
            if (detail.productVariant?.productColor?.product?.vendorId === user?.id) {
              allOrderDetails.push({ ...detail, order });
              if (order.status === 'completed') {
                revenue += detail.price * detail.quantity;
              }
            }
          });
        });

        // Sort recent order details by creation
        allOrderDetails.sort((a, b) => new Date(b.order.createdAt) - new Date(a.order.createdAt));

        // Reviews stats
        let totalRating = 0;
        let reviewCount = 0;
        products.forEach(p => {
          if (p.rating > 0) {
            // Approximation since we don't have exact total reviews endpoint here
            // Just average of product ratings
            totalRating += p.rating;
            reviewCount++;
          }
        });
        const avgRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

        setStats({
          revenue,
          totalOrders: orders.length,
          pendingOrders: pendingOrders.length,
          totalProducts: products.length,
          totalStock,
          lowStockCount,
          avgRating,
          reviewCount
        });
        
        setRecentOrderDetails(allOrderDetails.slice(0, 10)); // top 10
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Vendor Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenue"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.revenue)}
          icon={TrendingUp}
          color="bg-emerald-500"
          subtitle="From completed orders"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="bg-blue-500"
          subtitle={`${stats.pendingOrders} pending`}
        />
        <StatCard
          title="Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-indigo-500"
          subtitle={`${stats.totalStock} items in stock`}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats.avgRating} ★`}
          icon={Star}
          color="bg-amber-500"
          subtitle={`${stats.reviewCount} products rated`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Orders</h2>
            <Link to="/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Order ID</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Product</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Qty</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrderDetails.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">No orders yet</td>
                  </tr>
                ) : (
                  recentOrderDetails.map(od => (
                    <tr key={od.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-100">#{od.order.orderCode}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{od.productName} - {od.colorName}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{od.quantity}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          od.order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          od.order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {od.order.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(od.price * od.quantity)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Alerts</h2>
          <div className="space-y-4">
            {stats.lowStockCount > 0 && (
              <div className="flex items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Low Stock Warning</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stats.lowStockCount} variant(s) have 5 or fewer items.</p>
                </div>
              </div>
            )}
            <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
              <ShoppingCart className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Pending Orders</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stats.pendingOrders} order(s) waiting for processing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
