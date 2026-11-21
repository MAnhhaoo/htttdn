import { useQuery } from '@tanstack/react-query';
import { voucherService } from '../services/voucherService';

const EMPTY_OFFERS = [];

export function useVoucherOffers(productIds) {
  const ids = [...new Set(productIds.filter(Boolean))].sort();
  const query = useQuery({
    queryKey: ['voucher-offers', ids.join(',')],
    queryFn: () => voucherService.catalog(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  return query.data || EMPTY_OFFERS;
}
