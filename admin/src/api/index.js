import axiosClient from './axiosClient';

// ==================== AUTH ====================

export const authApi = {
  signIn: (data) => axiosClient.post('/auth/sign-in', data),
  signOut: () => axiosClient.post('/auth/sign-out'),
  refreshToken: () => axiosClient.post('/auth/refresh-token'),
  getProfile: () => axiosClient.get('/users/profile'),
};

// ==================== USERS ====================

export const usersApi = {
  getUsers: (params = {}) => axiosClient.get('/users', { params }),
  getUser: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, data) => axiosClient.patch(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};

// ==================== CATEGORIES ====================

export const categoriesApi = {
  getCategories: (params = {}) => axiosClient.get('/categories', { params }),
  createCategory: (data) => axiosClient.post('/categories', data),
  updateCategory: (id, data) => axiosClient.patch(`/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/categories/${id}`),
};

// ==================== PRODUCTS ====================

export const productsApi = {
  getProducts: (params = {}) => axiosClient.get('/products', { params }),
  createProduct: (data) => axiosClient.post('/products', data),
  updateProduct: (id, data) => axiosClient.patch(`/products/${id}`, data),
  deleteProduct: (id) => axiosClient.delete(`/products/${id}`),
};

// ==================== PRODUCT COLORS ====================

export const productColorsApi = {
  getByProductId: (productId) => axiosClient.get(`/productColors/product/${productId}`),
  getById: (id) => axiosClient.get(`/productColors/${id}`),
  create: (formData) => axiosClient.post('/productColors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => axiosClient.patch(`/productColors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => axiosClient.delete(`/productColors/${id}`),
};
