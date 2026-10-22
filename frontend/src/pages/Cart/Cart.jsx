import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Store, 
  Package 
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import VoucherPricing from '../../components/cart/VoucherPricing';

export default function Cart() {
  const navigate = useNavigate();
  const { 
    items, 
    isLoadingCart, 
    updateQuantity, 
    removeItem 
  } = useCart();

  // Selection state: set of selected CartItem IDs
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set());

  // Keep selection synchronized with loaded items
  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItemIds((prev) => {
        const next = new Set();
        const currentIds = new Set(items.map((i) => i.id));
        prev.forEach((id) => {
          if (currentIds.has(id)) next.add(id);
        });
        // Default to all selected if empty
        if (next.size === 0) {
          items.forEach((i) => next.add(i.id));
        }
        return next;
      });
    } else {
      setSelectedItemIds(new Set());
    }
  }, [items]);

  // Group items by Vendor (Shop)
  const vendorGroups = useMemo(() => {
    const groups = {};
    items.forEach((item) => {
      const vendor = item.productVariant?.productColor?.product?.vendor;
      const vId = vendor?.id || 'platform';
      const storeName = vendor?.storeName || 'Cửa hàng MIVA';
      if (!groups[vId]) {
        groups[vId] = {
          vendorId: vId,
          storeName,
          vendor,
          items: [],
        };
      }
      groups[vId].items.push(item);
    });
    return Object.values(groups);
  }, [items]);

  // Selected items & subtotal calculation
  const selectedItems = useMemo(() => {
    return items.filter((i) => selectedItemIds.has(i.id));
  }, [items, selectedItemIds]);
  const pricing = useCheckoutPricing(selectedItems);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + Number(item.productVariant?.price || 0) * item.quantity,
      0,
    );
  }, [selectedItems]);

  const selectedVendorsCount = useMemo(() => {
    const vIds = new Set(
      selectedItems.map((i) => i.productVariant?.productColor?.product?.vendorId || 'platform'),
    );
    return vIds.size;
  }, [selectedItems]);

  const isAllSelected = items.length > 0 && selectedItemIds.size === items.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(items.map((i) => i.id)));
    }
  };

  const toggleItem = (itemId) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleVendorGroup = (vendorItems) => {
    const vItemIds = vendorItems.map((i) => i.id);
    const isVendorAllSelected = vItemIds.every((id) => selectedItemIds.has(id));

    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (isVendorAllSelected) {
        vItemIds.forEach((id) => next.delete(id));
      } else {
        vItemIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleCheckoutShopOnly = (vendorItems) => {
    const ids = vendorItems.map((i) => i.id);
    navigate('/checkout', { state: { cartItemIds: ids, voucherSelections: pricing.selections.filter(selection => selection.vendorId === (vendorItems[0]?.productVariant?.productColor?.product?.vendorId || 'platform')) } });
  };

  const handleProceedCheckout = () => {
    if (selectedItemIds.size === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để tiến hành thanh toán');
      return;
    }
    navigate('/checkout', { state: { cartItemIds: Array.from(selectedItemIds), voucherSelections: pricing.selections } });
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Giỏ hàng của bạn</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Tổng cộng {items.length} sản phẩm từ {vendorGroups.length} nhà bán hàng
          </p>
        </div>

        {/* Global Select All Checkbox */}
        <div className="flex items-center gap-3 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border px-4 py-2.5 rounded-xl shadow-xs">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-light-text dark:text-dark-text select-none">
            <input 
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-primary rounded border-light-border dark:border-dark-border focus:ring-primary"
            />
            <span>Chọn tất cả ({items.length})</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items Grouped by Vendor */}
        <div className="flex-1 space-y-6">
          {vendorGroups.map((group) => {
            const vItemIds = group.items.map((i) => i.id);
            const isGroupSelected = vItemIds.every((id) => selectedItemIds.has(id));
            const isGroupPartiallySelected = !isGroupSelected && vItemIds.some((id) => selectedItemIds.has(id));
            const groupSubtotal = group.items.reduce(
              (sum, item) => sum + Number(item.productVariant?.price || 0) * item.quantity,
              0,
            );

            return (
              <div 
                key={group.vendorId} 
                className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Shop / Vendor Header */}
                <div className="p-4 sm:px-6 border-b border-light-border dark:border-dark-border bg-gray-50/70 dark:bg-dark-bg/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isGroupSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isGroupPartiallySelected;
                      }}
                      onChange={() => toggleVendorGroup(group.items)}
                      className="w-4 h-4 text-primary rounded border-light-border dark:border-dark-border focus:ring-primary cursor-pointer"
                    />

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-sm sm:text-base text-light-text dark:text-dark-text">
                          {group.storeName}
                        </span>
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          Gian hàng đối tác
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action to order only from this shop */}
                  <button 
                    type="button"
                    onClick={() => handleCheckoutShopOnly(group.items)}
                    className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mua riêng shop này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Items in this shop */}
                <ul className="divide-y divide-light-border dark:divide-dark-border">
                  {group.items.map((item) => {
                    const isSelected = selectedItemIds.has(item.id);

                    return (
                      <li 
                        key={item.id} 
                        className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 transition-colors ${
                          isSelected ? 'bg-transparent' : 'opacity-70 bg-gray-50/30 dark:bg-dark-bg/20'
                        }`}
                      >
                        {/* Item Checkbox */}
                        <div className="flex items-center self-start sm:self-center">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(item.id)}
                            className="w-4 h-4 text-primary rounded border-light-border dark:border-dark-border focus:ring-primary cursor-pointer"
                          />
                        </div>

                        {/* Product Image */}
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-light-surface dark:bg-dark-surface overflow-hidden shrink-0 border border-light-border dark:border-dark-border">
                          <img 
                            src={item.productVariant?.productColor?.imageUrls?.[0] || 'https://placehold.co/400x400?text=No+Image'}
                            alt={item.productVariant?.productColor?.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-bold text-light-text dark:text-dark-text text-base sm:text-lg">
                                <Link to={`/products/${item.productVariant?.productColor?.product?.id}`} className="hover:text-primary">
                                  {item.productVariant?.productColor?.product?.name}
                                </Link>
                              </h3>
                              <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1">
                                Màu: <span className="font-medium text-light-text dark:text-dark-text">{item.productVariant?.productColor?.color}</span> | 
                                Phân loại: <span className="font-medium text-light-text dark:text-dark-text">{item.productVariant?.size}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-base sm:text-lg text-primary">{formatPrice(item.productVariant?.price)}</p>
                              <p className="text-xs text-light-muted dark:text-dark-muted">Tồn kho: {item.productVariant?.stock}</p>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-gray-50 dark:bg-dark-bg h-9">
                              <button 
                                onClick={() => updateQuantity({ id: item.id, quantity: item.quantity - 1 })}
                                aria-label={`Giảm số lượng ${item.productVariant?.productColor?.product?.name}`}
                                disabled={item.quantity <= 1}
                                className="w-9 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center font-semibold text-xs sm:text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity({ id: item.id, quantity: item.quantity + 1 })}
                                aria-label={`Tăng số lượng ${item.productVariant?.productColor?.product?.name}`}
                                disabled={item.quantity >= item.productVariant?.stock}
                                className="w-9 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-xs sm:text-sm font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 p-2 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Xóa khỏi giỏ</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Shop Footer Subtotal */}
                <div className="p-3 sm:px-6 bg-gray-50/50 dark:bg-dark-bg/40 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs">
                  <span className="text-light-muted dark:text-dark-muted">
                    Tổng tiền kiện hàng ({group.items.length} sản phẩm):
                  </span>
                  <span className="font-bold text-sm text-light-text dark:text-dark-text">
                    {formatPrice(groupSubtotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sticky top-24 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-3">
              Tóm tắt đơn hàng
            </h2>

            {/* Multi-Vendor Splitting Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <Package className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Quy định đóng gói đơn hàng</span>
              </div>
              <p>
                {selectedVendorsCount > 1 ? (
                  <>
                    Bạn đang chọn sản phẩm từ <strong className="text-amber-700 dark:text-amber-300">{selectedVendorsCount} nhà bán hàng</strong> khác nhau. Khi đặt, hệ thống sẽ <strong>tách thành {selectedVendorsCount} đơn hàng riêng biệt</strong> để từng người bán tự đóng gói và giao hàng độc lập.
                  </>
                ) : selectedVendorsCount === 1 ? (
                  <>
                    Sản phẩm đang chọn thuộc về <strong>1 nhà bán hàng duy nhất</strong>. Đơn hàng sẽ được đóng gói chung bởi cửa hàng này.
                  </>
                ) : (
                  <>Chưa có sản phẩm nào được chọn để thanh toán.</>
                )}
              </p>
            </div>
            
            <VoucherPricing items={selectedItems} pricing={pricing} />
            <div className="space-y-3.5 text-sm">
              {pricing.data && <div className="flex justify-between text-emerald-700 dark:text-emerald-400"><span>Giảm giá voucher:</span><strong>-{formatPrice(pricing.data.discountAmount)}</strong></div>}
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Số sản phẩm chọn:</span>
                <span className="font-bold text-light-text dark:text-dark-text">
                  {selectedItems.length} sản phẩm
                </span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Số kiện hàng (đơn):</span>
                <span className="font-bold text-light-text dark:text-dark-text">
                  {selectedVendorsCount} kiện hàng
                </span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Tạm tính hàng hóa:</span>
                <span className="font-semibold text-light-text dark:text-dark-text">
                  {formatPrice(selectedSubtotal)}
                </span>
              </div>
              <div className="flex justify-between text-light-muted dark:text-dark-muted">
                <span>Phí vận chuyển:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Miễn phí</span>
              </div>

              <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between items-center">
                <div>
                  <span className="font-bold text-light-text dark:text-dark-text block">Tổng thanh toán</span>
                  <span className="text-[11px] text-light-muted dark:text-dark-muted">Đã bao gồm thuế và phí</span>
                </div>
                <span data-testid="cart-total" className="font-black text-2xl text-primary">{formatPrice(pricing.data?.totalAmount ?? selectedSubtotal)}</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleProceedCheckout}
              disabled={selectedItemIds.size === 0 || !pricing.ready}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Mua hàng ({selectedItems.length})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
