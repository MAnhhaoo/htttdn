import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import { useAuth } from './useAuth';

export const useOrders = (params = {}) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    enabled: isAuthenticated,
  });

  const createOrderMutation = useMutation({
    mutationFn: (payload) => orderService.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const rawOrders = Array.isArray(query.data) ? query.data : (query.data?.list || []);

  return {
    orders: rawOrders,
    meta: {
      totalItems: Array.isArray(query.data) ? query.data.length : (query.data?.totalItems || 0),
      totalPages: Array.isArray(query.data) ? 1 : (query.data?.totalPages || 0),
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
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
    refetch: query.refetch,
  };
};
