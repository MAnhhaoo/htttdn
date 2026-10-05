import { useState, useEffect } from 'react';
import { Star, Loader2, Search } from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { formatDate } from '../../utils/formatHelpers';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        // Fetch all products for the vendor
        const prodData = await productService.getVendorProducts({ itemPerPage: 100 });
        const products = Array.isArray(prodData) ? prodData : (prodData.list || []);

        // Fetch reviews for each product
        let allReviews = [];
        for (const product of products) {
          const prodReviews = await reviewService.getReviewsByProduct(product.id);
          // Attach product name so we can render it easily
          const reviewsWithProd = (prodReviews || []).map(r => ({
            ...r,
            productName: product.name
          }));
          allReviews = [...allReviews, ...reviewsWithProd];
        }

        // Sort by newest first
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setReviews(allReviews);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllReviews();
  }, []);

  const filteredReviews = reviews.filter(r => {
    const searchLower = search.toLowerCase();
    return (
      (r.productName || '').toLowerCase().includes(searchLower) ||
      (r.user?.fullName || '').toLowerCase().includes(searchLower) ||
      (r.content || '').toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Customer Reviews</h1>
          <p className="text-slate-500 dark:text-slate-400">See what customers say about your products</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 transition-colors rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 w-full md:w-96 border border-slate-200 dark:border-slate-700">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search by product, customer, or review content..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full dark:text-slate-200"
            />
          </div>
        </div>

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
              {filteredReviews.map(review => (
                <tr key={review.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">{review.productName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{review.user?.fullName || 'Unknown'}</td>
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
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {reviews.length === 0 ? 'No reviews yet for your products.' : 'No reviews match your search.'}
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
