import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { favoriteService } from '../services/favoriteService';

const extractProductId = (item) => item?.productId ?? item?.product?.id ?? item?.id;

export const useFavorites = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const data = await favoriteService.getFavorites();
      const list = data?.list ?? data?.data ?? data;
      return Array.isArray(list) ? list : [];
    },
    enabled: Boolean(isAuthenticated),
    staleTime: 5 * 60 * 1000,
  });

  const favorites = useMemo(() => (isAuthenticated ? query.data || [] : []), [isAuthenticated, query.data]);

  const favoriteIdSet = useMemo(() => {
    const set = new Set();
    favorites.forEach((item) => {
      const pid = extractProductId(item);
      if (pid) set.add(pid);
    });
    return set;
  }, [favorites]);

  const isFavorite = useCallback(
    (productId) => {
      if (!isAuthenticated || !productId) return false;
      return favoriteIdSet.has(productId);
    },
    [isAuthenticated, favoriteIdSet],
  );

  const toggleMutation = useMutation({
    mutationFn: async ({ productId, currentlyFavorited }) => {
      if (currentlyFavorited) {
        await favoriteService.removeFavorite(productId);
        return { productId, favorited: false };
      }
      await favoriteService.addFavorite(productId);
      return { productId, favorited: true };
    },
    onMutate: async ({ productId, currentlyFavorited, product }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previous = queryClient.getQueryData(['favorites']);

      queryClient.setQueryData(['favorites'], (old = []) => {
        const list = Array.isArray(old) ? old : [];
        if (currentlyFavorited) {
          return list.filter((item) => extractProductId(item) !== productId);
        }
        return [...list, product ? { id: productId, productId, product } : { id: productId, productId }];
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['favorites'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggleFavorite = useCallback(
    async (productId, product = null) => {
      const currentlyFavorited = favoriteIdSet.has(productId);
      return toggleMutation.mutateAsync({ productId, currentlyFavorited, product });
    },
    [favoriteIdSet, toggleMutation],
  );

  return {
    ...query,
    data: favorites,
    favorites,
    favoriteIdSet,
    isFavorite,
    toggleFavorite,
    isToggling: toggleMutation.isPending,
  };
};
