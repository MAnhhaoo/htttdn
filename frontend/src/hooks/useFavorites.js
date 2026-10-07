import { useQuery } from '@tanstack/react-query';
import { favoriteService } from '../services/favoriteService';
import { useSelector } from 'react-redux';

export const useFavorites = () => {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const data = await favoriteService.getFavorites();
      return data?.list || data || [];
    },
    enabled: isAuthenticated,
  });
};
