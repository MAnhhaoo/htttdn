import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    subtotal, 
    isLoadingCart, 
    updateQuantity, 
    removeItem 
  } = useCart();

  if (isLoadingCart) return <Loading text="Đang tải giỏ hàng..." />;

  if (items.length === 0) {
    return (
      <EmptyState 
        icon={ShoppingBag}
        title="Giỏ hàng trống" 
        description="Bạn chưa thêm sản phẩm nào vào giỏ hàng."
        actionText="Tiếp tục mua sắm"
        onAction={() => navigate('/products')}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-8">Giỏ hàng</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden">
            <ul className="divide-y divide-light-border dark:divide-dark-border">
              {items.map((item) => (
                <li key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-light-surface dark:bg-dark-surface overflow-hidden shrink-0 border border-light-border dark:border-dark-border">
                    <img 
                      src={item.productVariant?.productColor?.imageUrls?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                      alt={item.productVariant?.productColor?.product?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-light-text dark:text-dark-text text-lg">
                          <Link to={`/products/${item.productVariant?.productColor?.product?.id}`} className="hover:text-primary">
                            {item.productVariant?.productColor?.product?.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
                          Màu sắc: {item.productVariant?.productColor?.color} | 
                          Phân loại: {item.productVariant?.size}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">{formatPrice(item.productVariant?.price)}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg h-10">
                        <button 
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1}
                          className="w-10 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                          disabled={item.quantity >= item.productVariant?.stock}
                          className="w-10 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Xóa</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Tạm tính</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Giao hàng</span>
                <span className="text-green-500 font-medium">Miễn phí</span>
              </div>
              <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between items-center">
                <span className="font-bold text-light-text dark:text-dark-text">Tổng cộng</span>
                <span className="font-black text-xl text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link 
              to="/checkout"
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/30"
            >
              Thanh toán <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
