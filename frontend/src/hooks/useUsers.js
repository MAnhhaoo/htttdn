import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

// ===================== PROFILE HOOKS =====================

/**
 * Lấy profile user đang đăng nhập.
 */
export function useProfile(enabled = true) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
    enabled,
  });

  return { profile: data?.data || data || null, loading, error, refetch };
}

/**
 * Cập nhật profile user đang đăng nhập.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// ===================== ADMIN HOOKS =====================

/**
 * Lấy danh sách users (Admin only).
 * @param {Object} params - { page, limit, search, role, status }
 */
export function useUsers(params = {}, enabled = true) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    enabled,
  });

  return {
    users: data?.list || data?.data || data || [],
    totalPages: data?.totalPages || 1,
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
}

/**
 * Lấy danh sách user rút gọn cho dropdown/select (Admin only).
 */
export function useUserOptions(params = {}) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['userOptions', params],
    queryFn: () => userService.getUserOptions(params),
  });

  return { options: data?.list || data?.data || data || [], loading, error };
}

/**
 * Lấy chi tiết user theo ID (Admin only).
 */
export function useUser(id) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });

  return { user: data?.data || data || null, loading, error };
}

/**
 * Admin cập nhật user.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
}

/**
 * Admin xóa user.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
