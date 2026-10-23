import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  MapPin, 
  Check, 
  X, 
  Store, 
  Package 
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import { formatPrice } from '../../utils/formatPrice';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import VoucherPricing from '../../components/cart/VoucherPricing';
import Loading from '../../components/common/Loading/Loading';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { items, isLoadingCart } = useCart();
  const { user } = useAuth();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState({ type: '', text: '' });
  
  const [newAddressForm, setNewAddressForm] = useState({
    receiverName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine: '',
    isDefault: false,
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await addressService.getAddresses();
        const addressList = Array.isArray(res) ? res : res?.data || [];
        setAddresses(addressList);
        const defaultAddr = addressList.find(a => a.isDefault) || addressList[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error('Failed to fetch addresses', error);
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Determine which items are being checked out
  const checkoutItems = useMemo(() => {
    const specifiedIds = location.state?.cartItemIds;
    if (specifiedIds && Array.isArray(specifiedIds) && specifiedIds.length > 0) {
      const filtered = items.filter((i) => specifiedIds.includes(i.id));
      if (filtered.length > 0) return filtered;
    }
    return items;
  }, [items, location.state]);

  // Group checkout items by Vendor / Shop
  const vendorPackages = useMemo(() => {
    const groups = {};
    checkoutItems.forEach((item) => {
      const vendor = item.productVariant?.productColor?.product?.vendor;
      const vId = vendor?.id || 'platform';
      const storeName = vendor?.storeName || 'Cửa hàng MIVA';
      if (!groups[vId]) {
        groups[vId] = {
          vendorId: vId,
          storeName,
          items: [],
          subtotal: 0,
        };
      }
      groups[vId].items.push(item);
      groups[vId].subtotal += Number(item.productVariant?.price || 0) * item.quantity;
    });
    return Object.values(groups);
  }, [checkoutItems]);

  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) => sum + Number(item.productVariant?.price || 0) * item.quantity,
      0,
    );
  }, [checkoutItems]);
  const pricing = useCheckoutPricing(checkoutItems, location.state?.voucherSelections || []);

  if (isLoadingCart) {
    return <Loading text="Đang tải giỏ hàng..." />;
  }
  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleSaveNewAddress = async () => {
    const receiverName = newAddressForm.receiverName?.trim();
    const phone = newAddressForm.phone?.trim();
    const addressLine = newAddressForm.addressLine?.trim();

    if (!receiverName || receiverName.length < 2) {
      setAddressMsg({ type: 'error', text: 'Vui lòng nhập họ tên người nhận (tối thiểu 2 ký tự)' });
      return;
    }
    if (!phone || phone.length < 8) {
      setAddressMsg({ type: 'error', text: 'Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số)' });
      return;
    }
    if (!addressLine || addressLine.length < 5) {
      setAddressMsg({ type: 'error', text: 'Vui lòng nhập địa chỉ giao hàng chi tiết (tối thiểu 5 ký tự)' });
      return;
    }

    try {
      setIsSavingAddress(true);
      setAddressMsg({ type: '', text: '' });
      const payload = {
        receiverName,
        phone,
        addressLine,
        isDefault: newAddressForm.isDefault || addresses.length === 0,
      };
      const res = await addressService.createAddress(payload);
      const created = res?.data || res;

      // Refetch address list from real database
      const freshRes = await addressService.getAddresses();
      const freshList = Array.isArray(freshRes) ? freshRes : freshRes?.data || [];
      setAddresses(freshList);

      if (created?.id) {
        setSelectedAddressId(created.id);
      } else if (freshList.length > 0) {
        setSelectedAddressId(freshList[0].id);
      }

      setIsAddingNewAddress(false);
      setNewAddressForm({
        receiverName: user?.fullName || '',
        phone: user?.phone || '',
        addressLine: '',
        isDefault: false,
      });
      setAddressMsg({
        type: 'success',
        text: `Đã lưu địa chỉ mới thành công! Hiện bạn có ${freshList.length} địa chỉ trong sổ địa chỉ.`,
      });
      setTimeout(() => setAddressMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving address:', err);
      setAddressMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Lỗi khi lưu địa chỉ mới vào hệ thống',
      });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pricing.ready) {
      alert(pricing.error || 'Vui lòng chờ tính giá sau giảm.');
      return;
    }
    setIsSubmitting(true);
    try {
      let receiverName = '';
      let receiverPhone = '';
      let shippingAddress = '';

      if (selectedAddressId && Array.isArray(addresses)) {
        const addr = addresses.find(a => a.id === selectedAddressId);
        if (addr) {
          receiverName = addr.receiverName;
          receiverPhone = addr.phone;
          shippingAddress = [addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
        }
      }

      // If user filled in the new address form without explicitly clicking save
      if (!shippingAddress && isAddingNewAddress) {
        if (!newAddressForm.receiverName?.trim() || !newAddressForm.phone?.trim() || !newAddressForm.addressLine?.trim()) {
          alert('Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng và bấm "Xác nhận & Lưu địa chỉ mới"');
          setIsSubmitting(false);
          return;
        }
        // Auto-save the new address into database
        const res = await addressService.createAddress({
          receiverName: newAddressForm.receiverName.trim(),
          phone: newAddressForm.phone.trim(),
          addressLine: newAddressForm.addressLine.trim(),
          isDefault: newAddressForm.isDefault || addresses.length === 0,
        });
        const created = res?.data || res;
        receiverName = created.receiverName || newAddressForm.receiverName.trim();
        receiverPhone = created.phone || newAddressForm.phone.trim();
        shippingAddress = created.addressLine || newAddressForm.addressLine.trim();
      }

      if (!receiverName || receiverName.trim().length < 2) {
        alert('Vui lòng nhập họ tên người nhận (tối thiểu 2 ký tự)');
        setIsSubmitting(false);
        return;
      }
      if (!receiverPhone || receiverPhone.trim().length < 8) {
        alert('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số)');
        setIsSubmitting(false);
        return;
      }
      if (!shippingAddress || shippingAddress.trim().length < 5) {
        alert('Vui lòng chọn hoặc nhập địa chỉ giao hàng chi tiết (tối thiểu 5 ký tự)');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        voucherCodes: [],
        voucherSelections: pricing.selections,
        expectedTotalAmount: Number(pricing.data.totalAmount),
        cartItemIds: checkoutItems.map((i) => i.id),
      };

      const response = await orderService.checkout(payload);
      const resData = response?.data || response;
      const createdOrders = resData?.orders || (resData?.id ? [resData] : []);
      const numOrders = createdOrders.length;
      
      // Invalidate cart and orders queries
      queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      alert(`Đặt hàng thành công! Hệ thống đã tạo ${numOrders} đơn hàng độc lập cho ${numOrders} cửa hàng để đóng gói riêng biệt.`);

      if (paymentMethod === 'credit_card' || paymentMethod === 'pay_later') {
        const [firstId, ...remainingIds] = createdOrders.map(order => order.id);
        const remaining = remainingIds.length
          ? `?remaining=${encodeURIComponent(remainingIds.join(','))}`
          : '';
        navigate(`/payment-demo/${firstId}${remaining}`);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const errMessage = 
        error.response?.data?.errors?.[0]?.message || 
        error.response?.data?.message || 
        error.message || 
        'Không thể thực hiện thanh toán. Vui lòng thử lại!';
      alert(errMessage);
      pricing.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Thanh toán đơn hàng</h1>
        <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
          Đơn hàng sẽ được tách thành {vendorPackages.length} kiện hàng tương ứng với {vendorPackages.length} nhà bán hàng
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Địa chỉ nhận hàng
                </h2>
                {addresses.length > 0 && !isAddingNewAddress && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setAddressMsg({ type: '', text: '' });
                    }}
                    className="flex items-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm địa chỉ mới</span>
                  </Button>
                )}
              </div>

              {addressMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 ${
                  addressMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                }`}>
                  {addressMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                  <span>{addressMsg.text}</span>
                </div>
              )}
              
              {addresses.length > 0 && !isAddingNewAddress ? (
                <div className="space-y-3 mb-4">
                  <p className="font-medium text-xs text-light-muted dark:text-dark-muted">
                    Chọn địa chỉ giao hàng của bạn ({addresses.length} địa chỉ):
                  </p>
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
                      selectedAddressId === addr.id 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs' 
                        : 'border-light-border dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg'
                    }`}>
                      <input 
                        type="radio" 
                        name="address" 
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 text-primary focus:ring-primary h-4 w-4" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-light-text dark:text-dark-text">{addr.receiverName}</p>
                          <span className="text-xs text-light-muted dark:text-dark-muted">• {addr.phone}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                          {[addr.addressLine, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : null}

              {(addresses.length === 0 || isAddingNewAddress) && (
                <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-light-text dark:text-dark-text uppercase tracking-wider">
                      Nhập thông tin địa chỉ mới
                    </p>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setAddressMsg({ type: '', text: '' });
                        }}
                        className="text-xs text-light-muted hover:text-light-text flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hủy bỏ</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Người nhận *"
                      required
                      placeholder="Nguyễn Văn A"
                      value={newAddressForm.receiverName}
                      onChange={e => setNewAddressForm({ ...newAddressForm, receiverName: e.target.value })}
                    />
                    <Input
                      label="Số điện thoại *"
                      required
                      placeholder="0912345678"
                      value={newAddressForm.phone}
                      onChange={e => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Địa chỉ giao hàng chi tiết (Số nhà, đường, phường, quận, tỉnh) *"
                    required
                    placeholder="VD: 123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    value={newAddressForm.addressLine}
                    onChange={e => setNewAddressForm({ ...newAddressForm, addressLine: e.target.value })}
                  />

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-light-text dark:text-dark-text">
                      <input
                        type="checkbox"
                        checked={newAddressForm.isDefault}
                        onChange={e => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>Đặt làm địa chỉ nhận hàng mặc định</span>
                    </label>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveNewAddress}
                      isLoading={isSavingAddress}
                      className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Xác nhận & Lưu địa chỉ mới
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-xs">
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={e => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">Thanh toán khi nhận hàng (COD)</span>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={e => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">Thẻ tín dụng / Thẻ ghi nợ (Demo)</span>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'pay_later' ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs' : 'border-light-border dark:border-dark-border'}`}>
                  <input type="radio" name="payment" value="pay_later" checked={paymentMethod === 'pay_later'} onChange={e => setPaymentMethod(e.target.value)} className="text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">Mua trước trả sau (Pay Later Demo)</span>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-base font-bold shadow-lg shadow-primary/20 h-12 cursor-pointer" 
              isLoading={isSubmitting}
              disabled={!pricing.ready}
            >
              Xác nhận đặt {vendorPackages.length} đơn hàng
            </Button>
          </form>
        </div>

        {/* Order Summary & Multi-Vendor Packages Overview */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sticky top-24 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-3">
              Danh sách kiện hàng ({vendorPackages.length} kiện)
            </h2>

            {/* Explanatory Multi-Vendor Notice */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
              <Package className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Mỗi cửa hàng sẽ đóng gói sản phẩm của họ thành một đơn hàng riêng biệt với mã vận đơn riêng.
              </span>
            </div>
            
            {/* Packages List */}
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {vendorPackages.map((pkg, idx) => (
                <div 
                  key={pkg.vendorId} 
                  className="border border-light-border dark:border-dark-border rounded-xl p-3.5 bg-gray-50/50 dark:bg-dark-bg/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-light-text dark:text-dark-text pb-2 border-b border-light-border dark:border-dark-border">
                    <span className="flex items-center gap-1.5 text-primary">
                      <Store className="w-3.5 h-3.5" />
                      Kiện {idx + 1}: {pkg.storeName}
                    </span>
                    <span className="font-semibold text-light-text dark:text-dark-text">{formatPrice(pkg.subtotal)}</span>
                  </div>

                  <div className="space-y-2 pl-1">
                    {pkg.items.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-xs">
                        <div className="flex-1">
                          <p className="font-medium text-light-text dark:text-dark-text line-clamp-1">
                            {item.productVariant?.productColor?.product?.name}
                          </p>
                          <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                            SL: {item.quantity} | {item.productVariant?.productColor?.color} - {item.productVariant?.size}
                          </p>
                        </div>
                        <p className="font-bold text-light-text dark:text-dark-text">
                          {formatPrice((item.productVariant?.price || 0) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <VoucherPricing items={checkoutItems} pricing={pricing} />
            {/* Multi-vendor Split Invoices */}
            {vendorPackages.length > 1 && (
              <div className="space-y-3 pt-4 border-t border-light-border dark:border-dark-border">
                <div className="flex items-center justify-between text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                  <span>Hóa đơn theo từng kiện ({vendorPackages.length} kiện)</span>
                </div>

                <div className="space-y-2.5">
                  {vendorPackages.map((pkg, idx) => {
                    const pack = pricing.data?.packages?.find((p) => p.vendorId === pkg.vendorId);
                    const packDiscount = pack ? Number(pack.discountAmount) : 0;
                    const packTotal = pack ? Number(pack.totalAmount) : pkg.subtotal - packDiscount;

                    return (
                      <div 
                        key={pkg.vendorId}
                        className="p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-gray-50/70 dark:bg-dark-bg/60 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-light-text dark:text-dark-text pb-1.5 border-b border-light-border dark:border-dark-border">
                          <span className="flex items-center gap-1.5 text-primary">
                            <Store className="w-3.5 h-3.5" />
                            Kiện {idx + 1}: {pkg.storeName}
                          </span>
                          <span className="text-light-muted dark:text-dark-muted font-normal">
                            {pkg.items.length} SP
                          </span>
                        </div>

                        <div className="space-y-1 text-light-muted dark:text-dark-muted">
                          <div className="flex justify-between">
                            <span>Tạm tính tiền hàng:</span>
                            <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(pkg.subtotal)}</span>
                          </div>
                          {packDiscount > 0 ? (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                              <span>Giảm voucher shop:</span>
                              <span className="font-semibold">-{formatPrice(packDiscount)}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between">
                            <span>Phí giao hàng:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Miễn phí</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-dashed border-light-border dark:border-dark-border flex justify-between items-center font-bold">
                          <span className="text-light-text dark:text-dark-text">Thành tiền kiện {idx + 1}:</span>
                          <span className="text-primary text-sm font-extrabold">{formatPrice(packTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Cost Breakdown */}
            <div className="border-t border-light-border dark:border-dark-border pt-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-light-muted dark:text-dark-muted uppercase tracking-wider">
                <span>{vendorPackages.length > 1 ? 'Tổng thanh toán tất cả các kiện' : 'Chi tiết thanh toán'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-muted dark:text-dark-muted">Tạm tính ({checkoutItems.length} sản phẩm)</span>
                <span className="font-medium text-light-text dark:text-dark-text">{formatPrice(checkoutSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-light-muted dark:text-dark-muted">Phí giao hàng</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Miễn phí</span>
              </div>
              {pricing.data && (
                <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-400">
                  <span>Tổng giảm giá voucher</span>
                  <strong className="font-bold">-{formatPrice(pricing.data.discountAmount)}</strong>
                </div>
              )}
              <div className="border-t border-light-border dark:border-dark-border pt-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-light-text dark:text-dark-text block">Tổng cộng tất cả</span>
                  <span className="text-[11px] text-light-muted dark:text-dark-muted">
                    {vendorPackages.length > 1 ? `Cho ${vendorPackages.length} đơn hàng độc lập` : 'Đã bao gồm thuế và phí'}
                  </span>
                </div>
                <span data-testid="checkout-total" className="font-black text-2xl text-primary">{formatPrice(pricing.data?.totalAmount ?? checkoutSubtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
