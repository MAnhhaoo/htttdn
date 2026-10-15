import axiosClient from './axiosClient';

// ==================== AUTH ====================

export const authApi = {
  signIn: (data) => axiosClient.post('/auth/sign-in', data),
  signOut: () => axiosClient.post('/auth/sign-out'),
  refreshToken: () => axiosClient.post('/auth/refresh-token'),
  getProfile: () => axiosClient.get('/admins/profile'),
};

// ==================== USERS ====================

export const usersApi = {
  getUsers: (params = {}) => axiosClient.get('/users', { params }),
  getUser: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, data) => axiosClient.patch(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
};

// ==================== VENDORS ====================

export const vendorsApi = {
  getVendors: (params = {}) => axiosClient.get('/vendors', { params }),
  getVendor: (id) => axiosClient.get(`/vendors/${id}`),
  updateVendor: (id, data) => axiosClient.patch(`/vendors/${id}`, data),
  deleteVendor: (id) => axiosClient.delete(`/vendors/${id}`),
  getRegistrations: (params = {}) => axiosClient.get('/vendors/admin/registrations', { params }),
  approveRegistration: (id, data = {}) => axiosClient.patch(`/vendors/admin/registrations/${id}/approve`, data),
  rejectRegistration: (id, data = {}) => axiosClient.patch(`/vendors/admin/registrations/${id}/reject`, data),
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

// ==================== ORDERS ====================

export const ordersApi = {
  getOrders: (params = {}) => axiosClient.get('/orders/admin/all', { params }),
  updateOrderStatus: (id, status, note) => axiosClient.patch(`/orders/${id}/status`, { status, note }),
  assignOrder: (id, data) => axiosClient.patch(`/orders/${id}/assign`, data),
  autoAssignOrder: (id) => axiosClient.post(`/orders/${id}/auto-assign`),
  autoAssignAll: () => axiosClient.post('/orders/admin/auto-assign-all'),
};

// ==================== VOUCHERS ====================

export const vouchersApi = {
  getVouchers: (params = {}) => axiosClient.get('/vouchers/admin/all', { params }),
  createVoucher: (data) => axiosClient.post('/vouchers', data),
  updateVoucher: (id, data) => axiosClient.patch(`/vouchers/${id}`, data),
  deleteVoucher: (id) => axiosClient.delete(`/vouchers/${id}`),
};

// ==================== REVIEWS ====================

export const reviewsApi = {
  getReviews: (params = {}) => axiosClient.get('/reviews/admin/all', { params }),
  deleteReview: (id) => axiosClient.delete(`/reviews/admin/${id}`),
};

// ==================== REPORTS & ANALYTICS ====================

export const reportsApi = {
  getAnalytics: (params = {}) => axiosClient.get('/admin/reports/analytics', { params }),
  getCustomerReport: (params = {}) => axiosClient.get('/admin/reports/customers', { params }),
  getCustomerAnalytics: (params = {}) => axiosClient.get('/admin/reports/customer-analytics', { params }),
};

// ==================== EMPLOYEES ====================

export const employeesApi = {
  getEmployees: (params = {}) => axiosClient.get('/employees', { params }),
  getEmployee: (id) => axiosClient.get(`/employees/${id}`),
  createEmployee: (data) => axiosClient.post('/employees', data),
  updateEmployee: (id, data) => axiosClient.patch(`/employees/${id}`, data),
  updateStatus: (id, status) => axiosClient.patch(`/employees/${id}/status`, { status }),
  deleteEmployee: (id) => axiosClient.delete(`/employees/${id}`),
  getSalaryHistory: (id) => axiosClient.get(`/employees/${id}/salary-history`),
};

// ==================== SHIPPING ====================

export const shippingApi = {
  getShipments: (params = {}) => axiosClient.get('/shipping/shipments', { params }),
  getShipment: (id) => axiosClient.get(`/shipping/shipments/${id}`),
  updateStatus: (id, data) => axiosClient.patch(`/shipping/shipments/${id}/status`, data),
  assignCarrier: (id, data) => axiosClient.patch(`/shipping/shipments/${id}/assign`, data),
};

// ==================== PAYROLL ====================

export const payrollApi = {
  getPayrolls: (params = {}) => axiosClient.get('/payroll', { params }),
  calculate: (data) => axiosClient.post('/payroll/calculate', data),
  updatePayroll: (id, data) => axiosClient.patch(`/payroll/${id}`, data),
  recordAttendance: (data) => axiosClient.post('/payroll/attendance', data),
  getAttendance: (params = {}) => axiosClient.get('/payroll/attendance', { params }),
};

// ==================== SURVEYS ====================

export const surveysApi = {
  getSurveys: (params = {}) => axiosClient.get('/surveys/admin/all', { params }),
  getMine: (params = {}) => axiosClient.get('/surveys/mine', { params }),
  getTemplates: (target = 'client') => axiosClient.get('/surveys/templates', { params: { target } }),
  createSurvey: (data) => axiosClient.post('/surveys', data),
  getSurveyDetail: (id) => axiosClient.get(`/surveys/${id}/manage`),
  updateSurvey: (id, data) => axiosClient.patch(`/surveys/${id}`, data),
  changeStatus: (id, status) => axiosClient.patch(`/surveys/${id}/status`, { status }),
  getResults: (id, params = {}) => axiosClient.get(`/surveys/${id}/results`, { params }),
  deleteSurvey: (id) => axiosClient.delete(`/surveys/${id}`),
};

// ==================== NOTIFICATIONS ====================

export const notificationsApi = {
  getNotifications: (params = {}) => axiosClient.get('/notifications', { params }),
  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.patch('/notifications/read-all'),
};



