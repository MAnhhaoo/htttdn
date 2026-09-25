import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productColorService } from '../services/productColorService';

// ===================== QUERIES =====================

/**
 * Lấy danh sách màu sắc theo productId.
 */
export function useProductColors(productId) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['productColors', productId],
    queryFn: () => productColorService.getColorsByProductId(productId),
    enabled: !!productId,
  });

  return { colors: data?.data || data || [], loading, error, refetch };
}

/**
 * Lấy chi tiết một màu sản phẩm.
 */
export function useProductColor(id) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['productColor', id],
    queryFn: () => productColorService.getColorById(id),
    enabled: !!id,
  });

  return { color: data?.data || data || null, loading, error };
}

// ===================== MUTATIONS (Seller only) =====================

/**
 * Tạo màu mới cho sản phẩm.
 */
export function useCreateProductColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, imageFiles }) =>
      productColorService.createProductColor(data, imageFiles),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productColors', variables.data.productId] });
    },
  });
}

/**
 * Cập nhật màu sản phẩm.
 */
export function useUpdateProductColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, imageFiles }) =>
      productColorService.updateProductColor(id, data, imageFiles),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productColors'] });
      queryClient.invalidateQueries({ queryKey: ['productColor', variables.id] });
    },
  });
}

/**
 * Thêm ảnh mới vào một màu sản phẩm (giữ ảnh cũ).
 */
export function useAddProductColorImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageFiles }) =>
      productColorService.addImages(id, imageFiles),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productColors'] });
      queryClient.invalidateQueries({ queryKey: ['productColor', variables.id] });
    },
  });
}

/**
 * Khôi phục màu đã xóa mềm.
 */
export function useRestoreProductColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productColorService.restoreProductColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productColors'] });
    },
  });
}

/**
 * Xóa mềm màu sản phẩm.
 */
export function useDeleteProductColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productColorService.deleteProductColor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productColors'] });
    },
  });
}
