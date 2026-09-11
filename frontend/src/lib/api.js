const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}

export const api = {
  // Products
  getProducts: (params) => request(`/products?${new URLSearchParams(params)}`),
  getProduct: (id) => request(`/products/${id}`),
  getTrending: () => request('/products/trending'),
  getBestSellers: () => request('/products/best-sellers'),
  getNewArrivals: () => request('/products/new-arrivals'),
  getFlashDeals: () => request('/products/flash-deals'),
  getPremium: () => request('/products/premium'),
  getFeatured: () => request('/products/featured'),
  getSimilar: (id) => request(`/products/${id}/similar`),
  getBrands: () => request('/products/brands'),
  
  // Categories
  getCategories: () => request('/categories'),
  getCategory: (slug) => request(`/categories/${slug}`),
  
  // Search
  search: (q, params = {}) => request(`/search?q=${encodeURIComponent(q)}&${new URLSearchParams(params)}`),
  getSearchSuggestions: (q) => request(`/search/suggestions?q=${encodeURIComponent(q)}`),
  getPopularSearches: () => request('/search/popular'),
  
  // Cart
  getCart: () => request('/cart'),
  addToCart: (item) => request('/cart', { method: 'POST', body: JSON.stringify(item) }),
  updateCartItem: (itemId, quantity) => request(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (itemId) => request(`/cart/${itemId}`, { method: 'DELETE' }),
  
  // Orders
  getOrders: (status) => request(`/orders?status=${status || 'all'}`),
  getOrder: (id) => request(`/orders/${id}`),
  placeOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),
  
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request('/users/profile'),
  updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  
  // Wishlist
  getWishlist: () => request('/wishlist'),
  addToWishlist: (productId) => request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId) => request(`/wishlist/${productId}`, { method: 'DELETE' }),
  
  // Addresses
  getAddresses: () => request('/addresses'),
  addAddress: (data) => request('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id, data) => request(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id) => request(`/addresses/${id}`, { method: 'DELETE' }),
  
  // Vouchers
  getVouchers: () => request('/vouchers'),
  applyVoucher: (code, orderTotal) => request('/vouchers/apply', { method: 'POST', body: JSON.stringify({ code, orderTotal }) }),
  
  // Reviews
  getReviews: (productId) => request(`/reviews?productId=${productId}`),
  addReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  
  // Sellers
  getSeller: (id) => request(`/sellers/${id}`),
  
  // Deals
  getDeals: () => request('/deals'),
  getFlashSale: () => request('/deals/flash-sale'),
  getTodayDeals: () => request('/deals/today'),
  
  // Notifications
  getNotifications: () => request('/notifications'),
  markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
};
