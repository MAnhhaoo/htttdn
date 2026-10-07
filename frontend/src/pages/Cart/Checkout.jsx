import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receiverName: user?.fullName || '',
    phone: user?.phone || '',
    shippingAddress: user?.address || '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressService.getAddresses();
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let payload = {
        paymentMethod: formData.paymentMethod,
      };

      if (selectedAddressId) {
        const addr = addresses.find(a => a.id === selectedAddressId);
        payload.receiverName = addr.receiverName;
        payload.receiverPhone = addr.phone;
        payload.shippingAddress = addr.addressLine + (addr.ward ? `, ${addr.ward}` : '') + (addr.district ? `, ${addr.district}` : '') + (addr.province ? `, ${addr.province}` : '');
      } else {
        payload.receiverName = formData.receiverName;
        payload.receiverPhone = formData.phone;
        payload.shippingAddress = formData.shippingAddress;
      }

      const response = await orderService.checkout(payload);
      const order = response.data;
      
      alert('Order placed successfully!');
      if (formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'pay_later') {
        navigate(`/payment-demo/${order.id}`);
      } else {
        navigate('/orders');
      }
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
              
              {addresses.length > 0 ? (
                <div className="space-y-4 mb-4">
                  <p className="font-medium text-sm">Chọn địa chỉ giao hàng:</p>
                  {addresses.map(addr => (
                    <label key={addr.id} className="flex items-start gap-3 p-4 border border-light-border dark:border-dark-border rounded-xl cursor-pointer">
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-primary focus:ring-primary h-4 w-4" 
                      />
                      <div>
                        <p className="font-bold text-light-text dark:text-dark-text">{addr.receiverName} - {addr.phone}</p>
                        <p className="text-sm text-light-muted dark:text-dark-muted">{addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}</p>
                        {addr.isDefault && <span className="inline-block mt-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Mặc định</span>}
                      </div>
                    </label>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedAddressId('')}>
                    + Nhập địa chỉ khác
                  </Button>
                </div>
              ) : null}

              {(!addresses.length || !selectedAddressId) && (
                <div className="space-y-4">
                  <Input
                    label="Người nhận"
                    required
                    value={formData.receiverName}
                    onChange={e => setFormData({...formData, receiverName: e.target.value})}
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
              )}
            </div>

            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-light-text dark:text-dark-text">Thanh toán khi nhận hàng (COD)</span>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="credit_card" checked={formData.paymentMethod === 'credit_card'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-light-text dark:text-dark-text">Thẻ tín dụng (Demo)</span>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${formData.paymentMethod === 'pay_later' ? 'border-primary bg-primary/5' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="pay_later" checked={formData.paymentMethod === 'pay_later'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-light-text dark:text-dark-text">Trả sau (Demo)</span>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl opacity-50 cursor-not-allowed border-light-border dark:border-dark-border`}>
                  <input type="radio" disabled className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-light-text dark:text-dark-text">VNPay (Sắp ra mắt)</span>
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
                <span className="text-light-muted dark:text-dark-muted">Phí giao hàng</span>
                {subtotal >= 499000 ? (
                  <span className="text-green-500 font-medium">Miễn phí</span>
                ) : (
                  <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(30000)}</span>
                )}
              </div>
              <div className="border-t border-light-border dark:border-dark-border pt-3 flex justify-between items-center">
                <span className="font-bold text-light-text dark:text-dark-text">Tổng cộng</span>
                <span className="font-black text-xl text-primary">{formatPrice(subtotal + (subtotal >= 499000 ? 0 : 30000))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
