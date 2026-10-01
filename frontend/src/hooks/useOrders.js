import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { useAuth } from './useAuth';

export const useOrders = (params = {}) => {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    enabled: isAuthenticated,
  });

  return {
    orders: query.data?.list || [],
    meta: {
      totalItems: query.data?.totalItems || 0,
      totalPages: query.data?.totalPages || 0,
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
};

export const useOrderById = (id) => {
  const { isAuthenticated } = useAuth();
  
  const query = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id && isAuthenticated,
  });

  return {
    order: query.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
