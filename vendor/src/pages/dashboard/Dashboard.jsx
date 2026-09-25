import { Package, ShoppingCart, TrendingUp, Star, AlertTriangle } from 'lucide-react';
import { mockProducts, mockOrders, mockOrderDetails, mockProductVariants, mockProductColors, mockReviews, mockVendorProductMappings } from '../../data';

const CURRENT_VENDOR_ID = 3; // Nike Official - mock logged-in vendor

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
  const vendorProductIds = mockVendorProductMappings
    .filter(m => m.vendorId === CURRENT_VENDOR_ID)
    .map(m => m.productId);

  const vendorProducts = mockProducts.filter(p => vendorProductIds.includes(p.id));

  const vendorColorIds = mockProductColors
    .filter(c => vendorProductIds.includes(c.productId))
    .map(c => c.id);

  const vendorVariants = mockProductVariants.filter(v => vendorColorIds.includes(v.productColorId));
  const totalStock = vendorVariants.reduce((sum, v) => sum + v.stock, 0);
  const lowStockCount = vendorVariants.filter(v => v.stock > 0 && v.stock <= 5).length;

  // Calculate revenue from completed orders containing vendor products
  const vendorVariantIds = vendorVariants.map(v => v.id);
  const vendorOrderDetails = mockOrderDetails.filter(od => vendorVariantIds.includes(od.productVariantId));
  const vendorOrderIds = [...new Set(vendorOrderDetails.map(od => od.orderId))];
  const vendorOrders = mockOrders.filter(o => vendorOrderIds.includes(o.id));
  const completedRevenue = vendorOrderDetails
    .filter(od => {
      const order = mockOrders.find(o => o.id === od.orderId);
      return order && order.status === 'completed';
    })
    .reduce((sum, od) => sum + od.price * od.quantity, 0);

  const vendorReviews = mockReviews.filter(r => vendorProductIds.includes(r.productId));
  const avgRating = vendorReviews.length > 0
    ? (vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length).toFixed(1)
    : '0';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Vendor Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, Nike Official Store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenue"
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(completedRevenue)}
          icon={TrendingUp}
          color="bg-emerald-500"
          subtitle="From completed orders"
        />
        <StatCard
          title="Total Orders"
          value={vendorOrders.length}
          icon={ShoppingCart}
          color="bg-blue-500"
          subtitle={`${vendorOrders.filter(o => o.status === 'pending').length} pending`}
        />
        <StatCard
          title="Products"
          value={vendorProducts.length}
          icon={Package}
          color="bg-indigo-500"
          subtitle={`${totalStock} items in stock`}
        />
        <StatCard
          title="Avg Rating"
          value={`${avgRating} ★`}
          icon={Star}
          color="bg-amber-500"
          subtitle={`${vendorReviews.length} reviews`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Recent Orders</h2>
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
                {vendorOrderDetails.map(od => {
                  const order = mockOrders.find(o => o.id === od.orderId);
                  const variant = mockProductVariants.find(v => v.id === od.productVariantId);
                  const color = variant ? mockProductColors.find(c => c.id === variant.productColorId) : null;
                  const product = color ? mockProducts.find(p => p.id === color.productId) : null;
                  return (
                    <tr key={od.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-100">#{od.orderId}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{product?.name || 'N/A'}</td>
                      <td className="py-3 text-sm text-slate-600 dark:text-slate-400">{od.quantity}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order?.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order?.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order?.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(od.price * od.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Alerts</h2>
          <div className="space-y-4">
            {lowStockCount > 0 && (
              <div className="flex items-start p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Low Stock Warning</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lowStockCount} variant(s) have 5 or fewer items.</p>
                </div>
              </div>
            )}
            <div className="flex items-start p-3 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Pending Orders</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{vendorOrders.filter(o => o.status === 'pending').length} order(s) waiting for processing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
