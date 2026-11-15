import { useState, useEffect, useMemo } from 'react';
import { Star, Loader2, Search } from 'lucide-react';
import { useDebouncedValue } from '@shared/hooks/useDebouncedValue';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatHelpers';

const RATING_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: '5', label: '5 ★' },
  { id: '4', label: '4 ★' },
  { id: '3', label: '3 ★' },
  { id: '1-2', label: '1–2 ★' },
];

export default function ReviewManagement({ embedded = false }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    let mounted = true;
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        const prodData = await productService.getVendorProducts({ itemPerPage: 100 });
        const products = Array.isArray(prodData) ? prodData : prodData?.list || [];

        const perProductLists = await Promise.all(
          products.map(async (product) => {
            try {
              const prodReviews = await reviewService.getReviewsByProduct(product.id);
              return (Array.isArray(prodReviews) ? prodReviews : []).map((r) => ({
                ...r,
                productName: product.name,
              }));
            } catch {
              return [];
            }
          }),
        );

        const allReviews = perProductLists
          .flat()
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (mounted) {
          setReviews(allReviews);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách đánh giá:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllReviews();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return reviews.filter((r) => {
      const rating = Number(r.rating || 0);
      if (ratingFilter === '5' && rating !== 5) return false;
      if (ratingFilter === '4' && rating !== 4) return false;
      if (ratingFilter === '3' && rating !== 3) return false;
      if (ratingFilter === '1-2' && !(rating >= 1 && rating <= 2)) return false;

      if (!q) return true;
      return (
        (r.productName || '').toLowerCase().includes(q) ||
        (r.client?.fullName || r.user?.fullName || '').toLowerCase().includes(q) ||
        (r.content || '').toLowerCase().includes(q)
      );
    });
  }, [reviews, ratingFilter, debouncedSearch]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Đánh giá Khách hàng
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Theo dõi phản hồi và mức độ hài lòng của người mua về sản phẩm của Shop
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 w-full lg:w-96 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, khách hàng hoặc nội dung đánh giá..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {RATING_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setRatingFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  ratingFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Sản phẩm
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Mức sao
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Nội dung nhận xét
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {review.productName || 'Sản phẩm của Shop'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                    {review.client?.fullName || review.user?.fullName || 'Khách hàng'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${
                            starIdx <= Number(review.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 max-w-md">
                    <p className="line-clamp-2">{review.content || 'Không có lời bình'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                    {reviews.length === 0
                      ? 'Gian hàng chưa nhận được đánh giá nào cho các sản phẩm.'
                      : 'Không tìm thấy đánh giá nào khớp với bộ lọc hiện tại.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
