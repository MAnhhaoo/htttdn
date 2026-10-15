import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('employee_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('employee_token') || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('employee_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('employee_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('employee_token', token);
    } else {
      localStorage.removeItem('employee_token');
    }
  }, [token]);

  // Verify and fetch profile on app start if token exists
  useEffect(() => {
    if (!token) return;
    authApi.me()
      .then((profile) => {
        if (profile) {
          setUser(profile);
        }
      })
      .catch((err) => {
        console.warn('Phiên đăng nhập hết hạn hoặc chưa xác thực:', err.message);
      });
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Real API authentication with NestJS + PostgreSQL
      const tokens = await authApi.login(email, password);
      const accessToken = tokens.accessToken || tokens.data?.accessToken;
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('employee_token', accessToken);
      }

      // Fetch fresh authenticated profile from DB
      const profile = await authApi.me();
      setUser(profile);
      setIsLoading(false);
      return { success: true, user: profile };
    } catch (err) {
      setIsLoading(false);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('employee_user');
    localStorage.removeItem('employee_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
