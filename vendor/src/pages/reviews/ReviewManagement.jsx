import { Star } from 'lucide-react';
import { mockReviews, mockUsers, mockProducts, mockVendorProductMappings } from '../../data';
import { formatDate } from '../../utils/formatHelpers';

const CURRENT_VENDOR_ID = 3;

export default function ReviewManagement() {
  const vendorProductIds = mockVendorProductMappings
    .filter(m => m.vendorId === CURRENT_VENDOR_ID)
    .map(m => m.productId);

  const reviews = mockReviews.filter(r => vendorProductIds.includes(r.productId));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customer Reviews</h1>
        <p className="text-slate-500 dark:text-slate-400">See what customers say about your products</p>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Rating</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Review</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => {
                const user = mockUsers.find(u => u.id === review.userId);
                const product = mockProducts.find(p => p.id === review.productId);
                return (
                  <tr key={review.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{product?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{user?.fullName || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                      <p className="line-clamp-2">{review.content}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</td>
                  </tr>
                );
              })}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">No reviews yet for your products.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
