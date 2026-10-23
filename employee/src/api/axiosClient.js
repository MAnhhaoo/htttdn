import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'x-app-role': 'employee',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('employee_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data?.data !== undefined ? response.data.data : response.data,
  (error) => {
    if (!error.response) {
      error.message = error.code === 'ECONNABORTED'
        ? 'Yêu cầu quá thời gian. Vui lòng thử lại.'
        : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.';
    }
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('employee_token');
        localStorage.removeItem('employee_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    return axiosClient.post('/auth/sign-in', { email, password });
  },
  me: async () => {
    return axiosClient.get('/auth/me');
  },
  logout: async () => {
    return axiosClient.post('/auth/sign-out');
  },
};

export const ordersApi = {
  listAll: async (params = {}) => {
    return axiosClient.get('/orders/admin/all', { params });
  },
  getById: async (id) => {
    return axiosClient.get(`/orders/${id}`);
  },
  updateStatus: async (id, { status, note }) => {
    return axiosClient.patch(`/orders/${id}/status`, { status, note });
  },
};

export const profileApi = {
  getProfile: async () => {
    return axiosClient.get('/employees/profile');
  },
  updateProfile: async (data) => {
    return axiosClient.patch('/employees/profile', data);
  },
  getSalaryHistory: async (id) => {
    return axiosClient.get(`/employees/${id}/salary-history`);
  },
};

export const shippingApi = {
  getShipments: async (params = {}) => {
    return axiosClient.get('/shipping/shipments', { params });
  },
  getShipment: async (id) => {
    return axiosClient.get(`/shipping/shipments/${id}`);
  },
  updateStatus: async (id, data) => {
    return axiosClient.patch(`/shipping/shipments/${id}/status`, data);
  },
  assignCarrier: async (id, data) => {
    return axiosClient.patch(`/shipping/shipments/${id}/assign`, data);
  },
};

export const payrollApi = {
  getMyPayslips: async () => {
    return axiosClient.get('/payroll/my-payslips');
  },
  recordAttendance: async (data) => {
    return axiosClient.post('/payroll/attendance', data);
  },
  getAttendance: async (params = {}) => {
    return axiosClient.get('/payroll/attendance', { params });
  },
};

export const vendorsApi = {
  getRegistrations: async (params = {}) => {
    return axiosClient.get('/vendors/admin/registrations', { params });
  },
  approveRegistration: async (id, data = {}) => {
    return axiosClient.patch(`/vendors/admin/registrations/${id}/approve`, data);
  },
  rejectRegistration: async (id, data = {}) => {
    return axiosClient.patch(`/vendors/admin/registrations/${id}/reject`, data);
  },
};

export const notificationsApi = {
  getMyNotifications: async () => {
    return axiosClient.get('/employees/notifications/mine');
  },
  markRead: async (notifId) => {
    return axiosClient.patch(`/employees/notifications/${notifId}/read`);
  },
  markAllRead: async () => {
    return axiosClient.patch('/employees/notifications/read-all');
  },
};



