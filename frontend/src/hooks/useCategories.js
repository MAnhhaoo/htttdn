import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/categoryService';

export const useCategories = (params = {}) => {
  const query = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryService.getCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  return {
    categories: query.data?.list || [],
    meta: {
      totalItems: query.data?.totalItems || 0,
      totalPages: query.data?.totalPages || 0,
    },
    isLoading: query.isLoading,
    isError: query.isError
  };
};
