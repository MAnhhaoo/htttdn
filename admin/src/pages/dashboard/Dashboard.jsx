import { useState, useEffect } from 'react';
import { Users, Store, Package, ShoppingCart, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { usersApi, productsApi, categoriesApi } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

function StatCard({ title, value, icon: Icon, trend, trendValue, color, loading }) {
  return (
    <div className="bg-white dark:bg-slate-900 transition-colors p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 dark:text-slate-400 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        ) : (
          <>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h2>
            {trend && (
              <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? '+' : '-'}{trendValue}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dữ liệu song song
        const [usersRes, productsRes, categoriesRes] = await Promise.allSettled([
          usersApi.getUsers({ page: 1, itemPerPage: 5 }),
          productsApi.getProducts({ page: 1, itemPerPage: 1 }),
          categoriesApi.getCategories({ page: 1, itemPerPage: 1 }),
        ]);

        const usersData = usersRes.status === 'fulfilled' ? usersRes.value.data : null;
        const productsData = productsRes.status === 'fulfilled' ? productsRes.value.data : null;
        const categoriesData = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data : null;

        setStats({
          totalUsers: usersData?.totalItems || 0,
          totalProducts: productsData?.totalItems || 0,
          totalCategories: categoriesData?.totalItems || 0,
        });

        setRecentUsers(usersData?.list || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Xin chào, {user?.fullName || 'Admin'}! Chào mừng đến Admin Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon={Users} 
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts}
          icon={Package} 
          color="bg-green-500"
          loading={loading}
        />
        <StatCard 
          title="Total Categories" 
          value={stats.totalCategories}
          icon={Store} 
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard 
          title="Admin Panel" 
          value="Active"
          icon={TrendingUp} 
          color="bg-orange-500"
          loading={false}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Users</h2>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Đang tải...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">User</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Email</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Role</th>
                    <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(user => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-3 text-sm text-slate-800 dark:text-slate-300 font-medium">{user.fullName}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          user.role === 'seller' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Info</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Backend Connected</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hệ thống đang hoạt động bình thường.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Package className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{stats.totalProducts} Sản phẩm</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tổng số sản phẩm trong hệ thống.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="w-5 h-5 text-purple-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{stats.totalUsers} Users</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tổng số người dùng đăng ký.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
