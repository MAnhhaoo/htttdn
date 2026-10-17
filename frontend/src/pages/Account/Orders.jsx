import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  Star, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  X,
  CreditCard,
  Store
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../utils/formatPrice';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';

export default function Orders() {
  const { orders, isLoading, refetch } = useOrders();
  
  // Review modal state
  const [reviewItem, setReviewItem] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedMap, setReviewedMap] = useState({});

  // Cancel order state
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const handleOpenReview = (item, orderId) => {
    setReviewItem({ ...item, orderId });
    setRating(5);
    setHoverRating(0);
    setContent('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewItem) return;

    try {
      setSubmittingReview(true);
      await reviewService.createReview({
        orderDetailId: reviewItem.id,
        rating,
        content: content.trim() || undefined,
      });

      alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      setReviewedMap(prev => ({ ...prev, [reviewItem.id]: { rating, content } }));
      setReviewItem(null);
      if (refetch) refetch();
    } catch (err) {
      alert(`Lỗi gửi đánh giá: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Cancel order modal state
  const [cancelOrderTarget, setCancelOrderTarget] = useState(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState('Thay đổi nhu cầu mua sắm');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const CANCEL_REASONS = [
    'Thay đổi nhu cầu mua sắm',
    'Muốn cập nhật lại địa chỉ nhận hàng',
    'Muốn thay đổi sản phẩm / màu sắc / kích thước khác',
    'Tìm thấy giá tốt hơn ở nơi khác',
    'Thời gian giao hàng dự kiến quá lâu',
    'Lý do khác',
  ];

  const handleOpenCancelModal = (order) => {
    setCancelOrderTarget(order);
    setSelectedCancelReason('Thay đổi nhu cầu mua sắm');
    setCustomCancelReason('');
    setCancelError('');
    setCancelSuccess('');
  };

  const handleCloseCancelModal = () => {
    if (cancelLoading) return;
    setCancelOrderTarget(null);
    setCancelError('');
    setCancelSuccess('');
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelOrderTarget) return;

    let finalReason = selectedCancelReason;
    if (selectedCancelReason === 'Lý do khác') {
      if (!customCancelReason.trim()) {
        setCancelError('Vui lòng nhập nội dung lý do bạn muốn hủy đơn hàng');
        return;
      }
      finalReason = customCancelReason.trim();
    }

    try {
      setCancelLoading(true);
      setCancelError('');
      await orderService.cancelOrder(cancelOrderTarget.id, finalReason);
      setCancelSuccess('Đã hủy đơn hàng thành công!');
      setTimeout(() => {
        setCancelOrderTarget(null);
        if (refetch) refetch();
        else window.location.reload();
      }, 900);
    } catch (err) {
      setCancelError(err.response?.data?.message || err.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setCancelLoading(false);
    }
  };

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
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-700/50';
      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-500 dark:border-indigo-700/50';
      case 'shipping': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-500 dark:border-purple-700/50';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-500 dark:border-emerald-700/50';
      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-500 dark:border-rose-700/50';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Người bán đang chuẩn bị hàng';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Đã giao thành công';
      case 'cancelled': return 'Đã hủy đơn';
      default: return status;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Lịch sử đơn hàng</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-1">
            Quản lý, theo dõi quá trình giao nhận và đánh giá sản phẩm đã mua
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const isCompleted = order.status === 'completed';
          const isShipping = order.status === 'shipping';
          const isPending = order.status === 'pending';
          const isCancelled = order.status === 'cancelled';
          const storeName = 
            order.vendorOrders?.[0]?.vendor?.storeName ||
            order.details?.[0]?.productVariant?.productColor?.product?.vendor?.storeName ||
            null;

          return (
            <div key={order.id} className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl overflow-hidden shadow-xs">
              
              {/* Order Header */}
              <div className="p-4 sm:p-6 border-b border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-4 bg-gray-50/70 dark:bg-dark-bg/60">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-xs font-mono font-bold text-light-muted dark:text-dark-muted">
                      MÃ ĐƠN #{order.orderCode || order.id.slice(0, 8).toUpperCase()}
                    </p>
                    {storeName && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Store className="w-3.5 h-3.5" />
                        {storeName}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-light-text dark:text-dark-text">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-light-muted dark:text-dark-muted mb-0.5">Tổng thanh toán</p>
                    <p className="font-bold text-base text-primary">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Note Banners */}
              {isShipping && (
                <div className="px-5 py-2.5 bg-purple-50 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0 text-purple-600" />
                  <span>
                    <strong>Đơn hàng đang trên đường giao:</strong> Để đảm bảo hàng không thất lạc, quý khách không thể tự bấm hủy đơn trực tiếp trên ứng dụng. Vui lòng liên hệ nhân viên bưu tá khi nhận hàng nếu có sự cố.
                  </span>
                </div>
              )}

              {isCompleted && (
                <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>
                      <strong>Giao hàng thành công!</strong> Hãy dành ít phút đánh giá chất lượng sản phẩm để nhận điểm tích lũy và giúp cộng đồng mua sắm tốt hơn.
                    </span>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      <strong>Đơn hàng đã được hủy:</strong> {order.payment?.status === 'refunded' ? 'Tiền thanh toán trước đã được hoàn trả về ví/tài khoản của bạn.' : 'Yêu cầu thanh toán COD đã được hủy, không phát sinh chi phí.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="p-4 sm:p-6">
                <ul className="divide-y divide-light-border dark:divide-dark-border">
                  {order.details?.map((item) => {
                    const isReviewed = item.review || reviewedMap[item.id];

                    return (
                      <li key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border overflow-hidden shrink-0">
                            <img 
                              src={item.imageUrl || item.productVariant?.productColor?.imageUrls?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                              alt={item.productName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1 text-light-text dark:text-dark-text">{item.productName}</p>
                            <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                              Màu sắc: {item.colorName || item.productVariant?.productColor?.color} | Phân loại: {item.sizeName || item.productVariant?.size}
                            </p>
                            <p className="text-sm font-medium mt-1 text-light-text dark:text-dark-text">
                              {item.quantity} × <span className="text-primary">{formatPrice(item.price)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action on Item (Đánh giá sản phẩm) */}
                        <div className="sm:text-right shrink-0">
                          {isCompleted ? (
                            isReviewed ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>Đã đánh giá ({isReviewed.rating || item.review?.rating || 5}★)</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(item, order.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition transform hover:-translate-y-0.5"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Đánh giá sản phẩm
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-light-muted dark:text-dark-muted">
                              {isPending ? 'Đang chờ xác nhận' : isShipping ? 'Đang trên đường giao' : ''}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Order Footer Actions */}
                <div className="pt-4 mt-2 border-t border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-light-muted dark:text-dark-muted">
                    Phương thức thanh toán: <span className="font-semibold uppercase text-light-text dark:text-dark-text">{order.payment?.method || 'COD'}</span>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => handleOpenCancelModal(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Đánh giá sản phẩm */}
      {reviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-light-border dark:border-dark-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <h3 className="font-bold text-base text-light-text dark:text-dark-text flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Đánh giá sản phẩm
              </h3>
              <button onClick={() => setReviewItem(null)} className="text-light-muted hover:text-light-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
              <img 
                src={reviewItem.imageUrl || 'https://placehold.co/100x100?text=No+Image'} 
                alt={reviewItem.productName} 
                className="w-12 h-12 rounded object-cover border" 
              />
              <div className="flex-1">
                <p className="font-semibold text-xs text-light-text dark:text-dark-text line-clamp-1">{reviewItem.productName}</p>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">
                  {reviewItem.colorName} • Size {reviewItem.sizeName}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-2">
                  Chất lượng sản phẩm:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-2xl transition transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
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
                  onClick={() => setReviewItem(null)}
                  className="px-4 py-2 text-xs text-light-muted hover:text-light-text rounded-xl font-semibold transition"
                >
                  Để sau
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 text-xs bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-xs transition"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hủy đơn hàng với bảng tùy chọn lý do */}
      {cancelOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-dark-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-light-border dark:border-dark-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Hủy đơn hàng #{cancelOrderTarget.orderCode || cancelOrderTarget.id.slice(0, 8).toUpperCase()}
              </h3>
              <button 
                type="button" 
                onClick={handleCloseCancelModal}
                disabled={cancelLoading}
                className="text-light-muted hover:text-light-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{cancelError}</span>
              </div>
            )}

            {cancelSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{cancelSuccess}</span>
              </div>
            )}

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-light-text dark:text-dark-text mb-2.5">
                  Vui lòng chọn lý do hủy đơn hàng của bạn:
                </p>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => {
                    const isSelected = selectedCancelReason === reason;
                    return (
                      <label
                        key={reason}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs transition ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-semibold dark:bg-primary/10'
                            : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={isSelected}
                          onChange={() => setSelectedCancelReason(reason)}
                          className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span>{reason}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {selectedCancelReason === 'Lý do khác' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-light-text dark:text-dark-text mb-1">
                    Nhập chi tiết lý do khác của bạn <span className="text-rose-500">*</span>:
                  </label>
                  <textarea
                    rows={3}
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    required
                    placeholder="Vui lòng cho MIVA biết thêm thông tin để cải thiện dịch vụ..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-dark-bg/60 rounded-xl text-[11px] text-light-muted dark:text-dark-muted">
                Lưu ý: Sau khi xác nhận hủy, các voucher đã dùng sẽ được hoàn lại (nếu còn hạn) và đơn hàng không thể khôi phục lại trạng thái ban đầu.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  disabled={cancelLoading}
                  className="px-4 py-2 text-xs text-light-muted hover:text-light-text rounded-xl font-semibold transition"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={cancelLoading}
                  className="px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs transition disabled:opacity-60"
                >
                  {cancelLoading ? 'Đang xử lý hủy...' : 'Xác nhận hủy đơn hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
