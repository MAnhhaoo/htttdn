import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

// ===================== QUERIES =====================

/**
 * Lấy danh sách category (public).
 * @param {Object} params - { page, limit, search }
 */
export function useCategories(params = {}) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
  });

  return {
    categories: data?.list || data?.data || data || [],
    totalPages: data?.totalPages || 1,
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
}

// ===================== MUTATIONS (Admin only) =====================

/**
 * Tạo category mới.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * Cập nhật category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

/**
 * Xóa category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
