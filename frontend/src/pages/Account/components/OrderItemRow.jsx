import { Star } from 'lucide-react';
import { formatPrice } from '../../../utils/formatPrice';

export default function OrderItemRow({
  item,
  orderId,
  orderStatus,
  reviewedData,
  onOpenReview,
  compact = false,
}) {
  const isReviewed = item.review || reviewedData;
  const reviewRating = isReviewed?.rating || item.review?.rating || 5;
  const isCompleted = orderStatus === 'completed';
  const isCancelled = orderStatus === 'cancelled';

  const productName =
    item.productName ||
    item.productVariant?.productColor?.product?.name ||
    'Sản phẩm';
  const colorName =
    item.colorName ||
    item.productVariant?.productColor?.color ||
    'Mặc định';
  const sizeName = item.sizeName || item.productVariant?.size || 'Free';
  const imageUrl =
    item.imageUrl ||
    item.productVariant?.productColor?.imageUrls?.[0] ||
    'https://placehold.co/100x100?text=No+Image';

  if (compact) {
    return (
      <li className="py-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border overflow-hidden shrink-0">
            <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs line-clamp-1 text-light-text dark:text-dark-text">
              {productName}
            </p>
            <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
              {colorName} | Size {sizeName}
            </p>
            <p className="text-xs font-medium text-light-text dark:text-dark-text mt-0.5">
              {item.quantity} ×{' '}
              <span className="text-primary font-semibold">{formatPrice(item.price)}</span>
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p
            className={`font-semibold ${
              isCancelled
                ? 'line-through text-light-muted dark:text-dark-muted'
                : 'text-light-text dark:text-dark-text'
            }`}
          >
            {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
          </p>

          {isCompleted && (
            <div className="mt-1">
              {isReviewed ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Đã đánh giá ({reviewRating}★)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenReview(item, orderId)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-semibold transition cursor-pointer"
                >
                  <Star className="w-3 h-3" />
                  Đánh giá
                </button>
              )}
            </div>
          )}
        </div>
      </li>
    );
  }

  return (
    <li className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex gap-4 items-center min-w-0">
        <div className="w-16 h-16 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border overflow-hidden shrink-0">
          <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm line-clamp-1 text-light-text dark:text-dark-text">
            {productName}
          </p>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
            Màu sắc: {colorName} | Phân loại: {sizeName}
          </p>
          <p className="text-sm font-medium mt-1 text-light-text dark:text-dark-text">
            {item.quantity} × <span className="text-primary">{formatPrice(item.price)}</span>
          </p>
        </div>
      </div>

      <div className="sm:text-right shrink-0">
        <p
          className={`text-sm font-bold mb-1.5 ${
            isCancelled
              ? 'line-through text-light-muted dark:text-dark-muted'
              : 'text-light-text dark:text-dark-text'
          }`}
        >
          {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
        </p>

        {isCompleted ? (
          isReviewed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Đã đánh giá ({reviewRating}★)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenReview(item, orderId)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              Đánh giá sản phẩm
            </button>
          )
        ) : (
          <span className="text-xs text-light-muted dark:text-dark-muted">
            {orderStatus === 'pending'
              ? 'Đang chờ xác nhận'
              : orderStatus === 'shipping'
                ? 'Đang trên đường giao'
                : ''}
          </span>
        )}
      </div>
    </li>
  );
}
