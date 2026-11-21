import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
  Check,
  X,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import { useToast } from '../../components/common/Toast/Toast';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import OrderSummaryPanel, { groupCartItemsByVendor } from '../../components/cart/OrderSummaryPanel';
import Loading from '../../components/common/Loading/Loading';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { items, isLoadingCart } = useCart();
  const { user } = useAuth();

  // Shared ['addresses'] query with Profile.jsx
  const { data: addressRes, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.getAddresses(),
    enabled: Boolean(user),
  });

  const addresses = useMemo(
    () => (Array.isArray(addressRes) ? addressRes : addressRes?.data || []),
    [addressRes],
  );

  const reorderData = location.state?.reorderData || null;
  const REORDER_ADDRESS_ID = '__reorder_snapshot__';
  const hasReorderAddress = Boolean(
    reorderData?.receiverName?.trim() &&
      reorderData?.receiverPhone?.trim() &&
      reorderData?.shippingAddress?.trim(),
  );

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkoutCompletedRef = useRef(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState({ type: '', text: '' });

  const [newAddressForm, setNewAddressForm] = useState({
    receiverName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine: '',
    isDefault: false,
  });

  const [paymentMethod, setPaymentMethod] = useState(() => {
    const allowed = ['cod', 'credit_card', 'pay_later'];
    return allowed.includes(reorderData?.paymentMethod) ? reorderData.paymentMethod : 'cod';
  });

  // Auto-select previous reorder address (or matching saved address), else default address
  useEffect(() => {
    if (isLoadingAddresses || !user) return;

    if (hasReorderAddress) {
      const normalizedTarget = reorderData.shippingAddress.trim().toLowerCase();
      const matched = addresses.find((a) => {
        const full = [a.addressLine, a.ward, a.district, a.province]
          .filter(Boolean)
          .join(', ')
          .trim()
          .toLowerCase();
        return (
          full === normalizedTarget &&
          (a.receiverName || '').trim().toLowerCase() ===
            reorderData.receiverName.trim().toLowerCase() &&
          (a.phone || '').trim() === reorderData.receiverPhone.trim()
        );
      });
      setSelectedAddressId((prev) => {
        if (prev && (prev === REORDER_ADDRESS_ID || addresses.some((a) => a.id === prev))) {
          return prev;
        }
        return matched ? matched.id : REORDER_ADDRESS_ID;
      });
      setIsAddingNewAddress(false);
      return;
    }

    if (addresses.length > 0) {
      setSelectedAddressId((prev) => {
        if (prev && addresses.some((a) => a.id === prev)) return prev;
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        return defaultAddr?.id || '';
      });
    } else {
      setIsAddingNewAddress(true);
    }
  }, [addresses, isLoadingAddresses, user, hasReorderAddress, reorderData]);

  // Determine which items are being checked out
  const checkoutItems = useMemo(() => {
    const specifiedIds = location.state?.cartItemIds;
    if (specifiedIds && Array.isArray(specifiedIds) && specifiedIds.length > 0) {
      const filtered = items.filter((i) => specifiedIds.includes(i.id));
      if (filtered.length > 0) return filtered;
    }
    return items;
  }, [items, location.state]);

  const vendorPackages = useMemo(() => groupCartItemsByVendor(checkoutItems), [checkoutItems]);

  const pricing = useCheckoutPricing(
    checkoutItems,
    location.state?.voucherSelections || [],
    !isSubmitting && !checkoutCompletedRef.current,
    location.state?.platformVoucherCode || null,
  );

  if (isLoadingCart) {
    return <Loading text="Đang tải giỏ hàng..." />;
  }
  if (items.length === 0 && !isSubmitting && !checkoutCompletedRef.current) {
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

      await queryClient.invalidateQueries({ queryKey: ['addresses'] });

      if (created?.id) {
        setSelectedAddressId(created.id);
      }

      setIsAddingNewAddress(false);
      setNewAddressForm({
        receiverName: user?.fullName || '',
        phone: user?.phone || '',
        addressLine: '',
        isDefault: false,
      });
      toast.success('Đã lưu địa chỉ giao hàng mới');
      setAddressMsg({
        type: 'success',
        text: 'Đã lưu địa chỉ mới thành công và đồng bộ vào sổ địa chỉ của bạn.',
      });
      setTimeout(() => setAddressMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Error saving address:', err);
      const msg =
        err.response?.data?.message || err.message || 'Lỗi khi lưu địa chỉ mới vào hệ thống';
      setAddressMsg({ type: 'error', text: msg });
      toast.error(msg);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pricing.ready) {
      toast.warning(pricing.error || 'Vui lòng chờ tính giá sau giảm.');
      return;
    }
    setIsSubmitting(true);
    try {
      let receiverName = '';
      let receiverPhone = '';
      let shippingAddress = '';

      if (selectedAddressId === REORDER_ADDRESS_ID && hasReorderAddress) {
        receiverName = reorderData.receiverName;
        receiverPhone = reorderData.receiverPhone;
        shippingAddress = reorderData.shippingAddress;
      } else if (selectedAddressId && Array.isArray(addresses)) {
        const addr = addresses.find((a) => a.id === selectedAddressId);
        if (addr) {
          receiverName = addr.receiverName;
          receiverPhone = addr.phone;
          shippingAddress = [addr.addressLine, addr.ward, addr.district, addr.province]
            .filter(Boolean)
            .join(', ');
        }
      }

      if (!shippingAddress && isAddingNewAddress) {
        if (
          !newAddressForm.receiverName?.trim() ||
          !newAddressForm.phone?.trim() ||
          !newAddressForm.addressLine?.trim()
        ) {
          toast.warning(
            'Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng và bấm "Xác nhận & Lưu địa chỉ mới"',
          );
          setIsSubmitting(false);
          return;
        }
        const res = await addressService.createAddress({
          receiverName: newAddressForm.receiverName.trim(),
          phone: newAddressForm.phone.trim(),
          addressLine: newAddressForm.addressLine.trim(),
          isDefault: newAddressForm.isDefault || addresses.length === 0,
        });
        await queryClient.invalidateQueries({ queryKey: ['addresses'] });
        const created = res?.data || res;
        receiverName = created.receiverName || newAddressForm.receiverName.trim();
        receiverPhone = created.phone || newAddressForm.phone.trim();
        shippingAddress = created.addressLine || newAddressForm.addressLine.trim();
      }

      if (!receiverName || receiverName.trim().length < 2) {
        toast.warning('Vui lòng nhập họ tên người nhận (tối thiểu 2 ký tự)');
        setIsSubmitting(false);
        return;
      }
      if (!receiverPhone || receiverPhone.trim().length < 8) {
        toast.warning('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 8 chữ số)');
        setIsSubmitting(false);
        return;
      }
      if (!shippingAddress || shippingAddress.trim().length < 5) {
        toast.warning('Vui lòng chọn hoặc nhập địa chỉ giao hàng chi tiết (tối thiểu 5 ký tự)');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        ...(reorderData?.notes ? { notes: reorderData.notes } : {}),
        paymentMethod,
        voucherCodes: pricing.platformCode ? [pricing.platformCode] : [],
        voucherSelections: pricing.selections,
        expectedTotalAmount: Number(pricing.data.totalAmount),
        cartItemIds: checkoutItems.map((i) => i.id),
      };

      checkoutCompletedRef.current = true;
      const response = await orderService.checkout(payload);
      const resData = response?.data || response;
      const createdOrders = resData?.orders || (resData?.id ? [resData] : []);
      const numOrders = createdOrders.length;

      queryClient.invalidateQueries({ queryKey: ['cart'], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      toast.success(
        numOrders > 1
          ? `Đặt hàng thành công! Đã tạo ${numOrders} kiện đơn hàng cho ${numOrders} cửa hàng.`
          : 'Đặt hàng thành công!',
      );

      if (paymentMethod === 'credit_card' || paymentMethod === 'pay_later') {
        const [firstId, ...remainingIds] = createdOrders.map((order) => order.id);
        const remaining = remainingIds.length
          ? `?remaining=${encodeURIComponent(remainingIds.join(','))}`
          : '';
        navigate(`/payment-demo/${firstId}${remaining}`);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      checkoutCompletedRef.current = false;
      console.error('Checkout error:', error);
      const errMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        error.message ||
        'Không thể thực hiện thanh toán. Vui lòng thử lại!';
      toast.error(errMessage);
      pricing.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
            Thanh toán đơn hàng
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Đơn hàng sẽ được tách thành {vendorPackages.length} kiện hàng tương ứng với{' '}
            {vendorPackages.length} nhà bán hàng
          </p>
        </div>
        {reorderData && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-xs sm:text-sm text-light-text dark:text-dark-text flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>
              Đang <strong>mua lại theo thông tin đơn hàng trước</strong> (sản phẩm, số lượng, địa chỉ nhận hàng, phương thức thanh toán và ưu đãi còn hiệu lực). Vui lòng kiểm tra lại tổng tiền hiện tại trước khi xác nhận.
            </span>
          </div>
        )}
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
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4 ${
                    addressMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                  }`}
                >
                  {addressMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{addressMsg.text}</span>
                </div>
              )}

              {(addresses.length > 0 || hasReorderAddress) && !isAddingNewAddress ? (
                <div className="space-y-3 mb-4">
                  <p className="font-medium text-xs text-light-muted dark:text-dark-muted">
                    Chọn địa chỉ giao hàng của bạn ({addresses.length + (hasReorderAddress && selectedAddressId === REORDER_ADDRESS_ID ? 1 : 0)} địa chỉ):
                  </p>
                  {hasReorderAddress &&
                    !addresses.some((a) => {
                      const full = [a.addressLine, a.ward, a.district, a.province]
                        .filter(Boolean)
                        .join(', ')
                        .trim()
                        .toLowerCase();
                      return (
                        full === reorderData.shippingAddress.trim().toLowerCase() &&
                        (a.receiverName || '').trim().toLowerCase() ===
                          reorderData.receiverName.trim().toLowerCase() &&
                        (a.phone || '').trim() === reorderData.receiverPhone.trim()
                      );
                    }) && (
                      <label
                        className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
                          selectedAddressId === REORDER_ADDRESS_ID
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                            : 'border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={REORDER_ADDRESS_ID}
                          checked={selectedAddressId === REORDER_ADDRESS_ID}
                          onChange={() => setSelectedAddressId(REORDER_ADDRESS_ID)}
                          className="mt-1 text-primary focus:ring-primary h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm text-light-text dark:text-dark-text">
                              {reorderData.receiverName}
                            </p>
                            <span className="text-xs text-light-muted dark:text-dark-muted">
                              • {reorderData.receiverPhone}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-primary/15 text-primary font-bold rounded-full">
                              Từ đơn hàng trước
                            </span>
                          </div>
                          <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                            {reorderData.shippingAddress}
                          </p>
                        </div>
                      </label>
                    )}
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                          : 'border-light-border dark:border-dark-border hover:bg-light-bg dark:hover:bg-dark-bg'
                      }`}
                    >
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
                          <p className="font-bold text-sm text-light-text dark:text-dark-text">
                            {addr.receiverName}
                          </p>
                          <span className="text-xs text-light-muted dark:text-dark-muted">
                            • {addr.phone}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-bold rounded-full">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-light-muted dark:text-dark-muted mt-1 leading-relaxed">
                          {[addr.addressLine, addr.ward, addr.district, addr.province]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : null}

              {((addresses.length === 0 && !hasReorderAddress) || isAddingNewAddress) && (
                <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border space-y-4">
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
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, receiverName: e.target.value })
                      }
                    />
                    <Input
                      label="Số điện thoại *"
                      required
                      placeholder="0912345678"
                      value={newAddressForm.phone}
                      onChange={(e) =>
                        setNewAddressForm({ ...newAddressForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <Input
                    label="Địa chỉ giao hàng chi tiết (Số nhà, đường, phường, quận, tỉnh) *"
                    required
                    placeholder="VD: 123 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    value={newAddressForm.addressLine}
                    onChange={(e) =>
                      setNewAddressForm({ ...newAddressForm, addressLine: e.target.value })
                    }
                  />

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-light-text dark:text-dark-text">
                      <input
                        type="checkbox"
                        checked={newAddressForm.isDefault}
                        onChange={(e) =>
                          setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })
                        }
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
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                      : 'border-light-border dark:border-dark-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'credit_card'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                      : 'border-light-border dark:border-dark-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">
                    Thẻ tín dụng / Thẻ ghi nợ (Demo)
                  </span>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'pay_later'
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                      : 'border-light-border dark:border-dark-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pay_later"
                    checked={paymentMethod === 'pay_later'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="font-medium text-sm text-light-text dark:text-dark-text">
                    Mua trước trả sau (Pay Later Demo)
                  </span>
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

        {/* Unified Order Summary & Multi-Vendor Packages Panel */}
        <div className="w-full lg:w-96 xl:w-[420px] shrink-0">
          <OrderSummaryPanel mode="checkout" items={checkoutItems} pricing={pricing} />
        </div>
      </div>
    </div>
  );
}
