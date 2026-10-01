import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function Orders() {
  const { orders, isLoading } = useOrders();

  if (isLoading) return <Loading text="Đang tải danh sách đơn hàng..." />;

  if (orders.length === 0) {
    return (
      <EmptyState 
        icon={Package}
        title="Chưa có đơn hàng nào" 
        description="Khi bạn đặt hàng, danh sách đơn hàng sẽ xuất hiện tại đây."
        actionText="Bắt đầu mua sắm"
        onAction={() => window.location.href = '/products'}
      />
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-700/50';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-700/50';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-500 dark:border-purple-700/50';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-500 dark:border-green-700/50';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-700/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8">Lịch sử đơn hàng</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-dark-bg">
              <div>
                <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Mã đơn #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-semibold text-light-text dark:text-dark-text">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-light-muted dark:text-dark-muted mb-1">Tổng cộng</p>
                <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <ul className="divide-y divide-light-border dark:divide-dark-border">
                {order.details?.map((item) => (
                  <li key={item.id} className="py-4 flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shrink-0">
                      <img 
                        src={item.imageUrl || 'https://placehold.co/100x100?text=No+Image'}
                        alt={item.productName} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-1 text-light-text dark:text-dark-text">{item.productName}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                        Màu sắc: {item.colorName} | Phân loại: {item.sizeName}
                      </p>
                      <p className="text-sm font-medium mt-1 text-light-text dark:text-dark-text">
                        {item.quantity} × <span className="text-primary">{formatPrice(item.price)}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
