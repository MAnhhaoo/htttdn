import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: user?.address || '',
    phone: user?.phone || '',
    paymentMethod: 'cod'
  });

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        totalAmount: subtotal,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
      });
      // In a real app, clear cart context / refetch here if backend doesn't automatically.
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-8">Thanh toán</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Thông tin giao hàng</h2>
              <div className="space-y-4">
                <Input
                  label="Họ và tên"
                  value={user?.fullName || ''}
                  disabled
                />
                <Input
                  label="Số điện thoại"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <Input
                  label="Địa chỉ giao hàng"
                  required
                  value={formData.shippingAddress}
                  onChange={e => setFormData({...formData, shippingAddress: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-primary bg-primary/5 rounded-xl cursor-pointer">
                  <input type="radio" name="payment" checked readOnly className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-light-text dark:text-dark-text">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
              Đặt hàng
            </Button>
          </form>
        </div>

        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-6">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text line-clamp-1">{item.productVariant?.productColor?.product?.name}</p>
                    <p className="text-xs text-light-muted dark:text-dark-muted">SL: {item.quantity} | {item.productVariant?.productColor?.color} - {item.productVariant?.size}</p>
                  </div>
                  <p className="text-sm font-bold">{formatPrice(item.productVariant?.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-light-border dark:border-dark-border pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-light-muted dark:text-dark-muted">Tạm tính</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-muted dark:text-dark-muted">Giao hàng</span>
                <span className="text-green-500 font-medium">Miễn phí</span>
              </div>
              <div className="border-t border-light-border dark:border-dark-border pt-3 flex justify-between items-center">
                <span className="font-bold text-light-text dark:text-dark-text">Tổng cộng</span>
                <span className="font-black text-xl text-primary">{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
