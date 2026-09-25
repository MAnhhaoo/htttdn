import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../services/productService';

// ===================== QUERIES =====================

/**
 * Lấy danh sách sản phẩm (public).
 * @param {Object} params - { page, limit, search, categoryId, status }
 */
export function useProducts(params = {}) {
  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });

  return {
    products: data?.list || data?.data || data || [],
    totalPages: data?.totalPages || 1,
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
}

/**
 * Lấy chi tiết sản phẩm theo ID.
 */
export function useProduct(id) {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });

  return { product: data?.data || data || null, loading, error };
}

// ===================== MUTATIONS =====================

/**
 * Tạo sản phẩm mới (Vendor/Seller).
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Cập nhật sản phẩm (Vendor/Seller).
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

/**
 * Xóa sản phẩm (Vendor/Seller).
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

/**
 * Flash deals — lấy sản phẩm đang giảm giá (tạm thời dùng chung API products).
 */
export function useFlashDeals() {
  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['flashDeals'],
    queryFn: () => productService.getProducts({ limit: 8 }),
  });

  return { deals: data?.list || data?.data || data || [], loading, error };
}
