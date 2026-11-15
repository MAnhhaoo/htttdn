import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { reviewService } from '../../../services/reviewService';
import { useToast } from '../../../components/common/Toast/Toast';

export default function OrderReviewModal({ reviewItem, onClose, onReviewSubmitted }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reviewItem) {
      setRating(5);
      setHoverRating(0);
      setContent('');
    }
  }, [reviewItem]);

  if (!reviewItem) return null;

  const productName =
    reviewItem.productName ||
    reviewItem.productVariant?.productColor?.product?.name ||
    'Sản phẩm';
  const colorName =
    reviewItem.colorName ||
    reviewItem.productVariant?.productColor?.color ||
    'Mặc định';
  const sizeName = reviewItem.sizeName || reviewItem.productVariant?.size || 'Free';
  const imageUrl =
    reviewItem.imageUrl ||
    reviewItem.productVariant?.productColor?.imageUrls?.[0] ||
    'https://placehold.co/100x100?text=No+Image';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await reviewService.createReview({
        orderDetailId: reviewItem.id,
        rating,
        content: content.trim() || undefined,
      });
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
      onReviewSubmitted?.(reviewItem.id, { rating, content: content.trim() });
      onClose();
    } catch (err) {
      toast.error(`Lỗi gửi đánh giá: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-light-border dark:border-dark-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
          <h3 className="font-bold text-base text-light-text dark:text-dark-text flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Đánh giá sản phẩm
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-light-muted hover:text-light-text dark:hover:text-dark-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-light-bg dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
          <img
            src={imageUrl}
            alt={productName}
            className="w-12 h-12 rounded-lg object-cover border border-light-border dark:border-dark-border"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-light-text dark:text-dark-text line-clamp-1">
              {productName}
            </p>
            <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
              {colorName} • Size {sizeName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-2">
              Chất lượng sản phẩm:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl transition transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-semibold text-amber-600 ml-2">
                {rating === 5 && 'Tuyệt vời ★★★★★'}
                {rating === 4 && 'Hài lòng ★★★★'}
                {rating === 3 && 'Bình thường ★★★'}
                {rating === 2 && 'Không hài lòng ★★'}
                {rating === 1 && 'Rất tệ ★'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
              Nhận xét chi tiết:
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm về chất lượng sản phẩm, form dáng, đóng gói..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs text-light-muted hover:text-light-text dark:hover:text-dark-text rounded-xl font-semibold transition cursor-pointer"
            >
              Để sau
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
