import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';

export const useProducts = (params = {}) => {
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      // Map frontend params to backend strict params
      const apiParams = {
        itemPerPage: params.limit || 12,
      };
      if (params.q || params.search) apiParams.search = params.q || params.search;
      if (params.page) apiParams.page = params.page;
      if (params.createdAfter) apiParams.createdAfter = params.createdAfter;
      if (params.minPrice) apiParams.minPrice = params.minPrice;
      if (params.maxPrice) apiParams.maxPrice = params.maxPrice;
      if (params.vendorId) apiParams.vendorId = params.vendorId;
      
      // Backend uses strict validation (PaginationQuerySchema.strict()),
      // so only send: page, itemPerPage, search, vendorId.
      // Sorting is always createdAt:desc server-side.
      
      if (params.category && !params.vendorId) {
        return productService.getProductsByCategory(params.category, apiParams);
      }
      if (params.category && params.vendorId) {
        apiParams.category = params.category;
      }
      return productService.getProducts(apiParams);
    },
    keepPreviousData: true,
  });

  return {
    products: query.data?.list || [],
    meta: {
      totalItems: query.data?.totalItems || 0,
      totalPages: query.data?.totalPages || 0,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error
  };
};

export const useBestSellingProducts = (params = {}) => {
  const query = useQuery({
    queryKey: ['products', 'best-sellers', params],
    queryFn: () => productService.getBestSellers(params),
  });

  return {
    products: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  };
};

export const useProductById = (id) => {
  const query = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
  });

  return {
    product: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
};
