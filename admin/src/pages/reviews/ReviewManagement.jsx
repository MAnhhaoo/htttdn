import { Eye, Star } from 'lucide-react';
import { mockReviews, mockUsers, mockProducts } from '../../data';
import { formatDate } from '../../utils/formatHelpers';

export default function ReviewManagement() {
  const reviews = mockReviews;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Review Management</h1>
        <p className="text-slate-500 dark:text-slate-400">{reviews.length} reviews</p>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Rating</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Content</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => {
                const user = mockUsers.find(u => u.id === review.userId);
                const product = mockProducts.find(p => p.id === review.productId);
                return (
                  <tr key={review.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{user?.fullName || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{product?.name || 'Unknown'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{review.content}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(review.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
