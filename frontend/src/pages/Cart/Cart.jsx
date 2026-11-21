import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { useToast } from '../../components/common/Toast/Toast';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import OrderSummaryPanel, { groupCartItemsByVendor } from '../../components/cart/OrderSummaryPanel';

export default function Cart() {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, isLoadingCart, updateQuantity, removeItem } = useCart();

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
        if (next.size === 0) {
          items.forEach((i) => next.add(i.id));
        }
        return next;
      });
    } else {
      setSelectedItemIds(new Set());
    }
  }, [items]);

  // Group all cart items by Vendor (Shop)
  const vendorGroups = useMemo(() => groupCartItemsByVendor(items), [items]);

  // Selected items & pricing preview
  const selectedItems = useMemo(
    () => items.filter((i) => selectedItemIds.has(i.id)),
    [items, selectedItemIds],
  );
  const pricing = useCheckoutPricing(selectedItems);

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
    const targetVendorId =
      vendorItems[0]?.productVariant?.productColor?.product?.vendorId || 'platform';
    navigate('/checkout', {
      state: {
        cartItemIds: ids,
        voucherSelections: pricing.selections.filter(
          (selection) => selection.vendorId === targetVendorId,
        ),
        platformVoucherCode: pricing.platformCode,
      },
    });
  };

  const handleProceedCheckout = () => {
    if (selectedItemIds.size === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 sản phẩm để tiến hành thanh toán');
      return;
    }
    navigate('/checkout', {
      state: {
        cartItemIds: Array.from(selectedItemIds),
        voucherSelections: pricing.selections,
        platformVoucherCode: pricing.platformCode,
      },
    });
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
            const isGroupPartiallySelected =
              !isGroupSelected && vItemIds.some((id) => selectedItemIds.has(id));

            return (
              <div
                key={group.vendorId}
                className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Shop / Vendor Header */}
                <div className="p-4 sm:px-6 border-b border-light-border dark:border-dark-border bg-light-bg/70 dark:bg-dark-bg/60 flex flex-wrap items-center justify-between gap-3">
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
                          isSelected ? 'bg-transparent' : 'opacity-70 bg-light-bg/40 dark:bg-dark-bg/20'
                        }`}
                      >
                        <div className="flex items-center self-start sm:self-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItem(item.id)}
                            className="w-4 h-4 text-primary rounded border-light-border dark:border-dark-border focus:ring-primary cursor-pointer"
                          />
                        </div>

                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl bg-light-bg dark:bg-dark-bg overflow-hidden shrink-0 border border-light-border dark:border-dark-border">
                          <img
                            src={
                              item.productVariant?.productColor?.imageUrls?.[0] ||
                              'https://placehold.co/400x400?text=No+Image'
                            }
                            alt={item.productVariant?.productColor?.product?.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-bold text-light-text dark:text-dark-text text-base sm:text-lg">
                                <Link
                                  to={`/products/${item.productVariant?.productColor?.product?.id}`}
                                  className="hover:text-primary"
                                >
                                  {item.productVariant?.productColor?.product?.name}
                                </Link>
                              </h3>
                              <p className="text-xs sm:text-sm text-light-muted dark:text-dark-muted mt-1">
                                Màu:{' '}
                                <span className="font-medium text-light-text dark:text-dark-text">
                                  {item.productVariant?.productColor?.color}
                                </span>{' '}
                                | Phân loại:{' '}
                                <span className="font-medium text-light-text dark:text-dark-text">
                                  {item.productVariant?.size}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-base sm:text-lg text-primary">
                                {formatPrice(item.productVariant?.price)}
                              </p>
                              <p className="text-xs text-light-muted dark:text-dark-muted">
                                Tồn kho: {item.productVariant?.stock}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg h-9">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity({ id: item.id, quantity: item.quantity - 1 })
                                }
                                aria-label={`Giảm số lượng ${item.productVariant?.productColor?.product?.name}`}
                                disabled={item.quantity <= 1}
                                className="w-9 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center font-semibold text-xs sm:text-sm">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity({ id: item.id, quantity: item.quantity + 1 })
                                }
                                aria-label={`Tăng số lượng ${item.productVariant?.productColor?.product?.name}`}
                                disabled={item.quantity >= item.productVariant?.stock}
                                className="w-9 h-full flex items-center justify-center text-light-muted hover:text-primary disabled:opacity-40 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
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
                <div className="p-3 sm:px-6 bg-light-bg/50 dark:bg-dark-bg/40 border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs">
                  <span className="text-light-muted dark:text-dark-muted">
                    Tổng tiền kiện hàng ({group.items.length} sản phẩm):
                  </span>
                  <span className="font-bold text-sm text-light-text dark:text-dark-text">
                    {formatPrice(group.subtotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified Order Summary Sidebar */}
        <div className="w-full lg:w-88 xl:w-96 shrink-0">
          <OrderSummaryPanel
            mode="cart"
            items={selectedItems}
            pricing={pricing}
            onProceedCheckout={handleProceedCheckout}
          />
        </div>
      </div>
    </div>
  );
}
