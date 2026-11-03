import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { voucherService } from '../services/voucherService';

export function useCheckoutPricing(items, initialSelections = [], enabled = true) {
  const userId = useSelector(state => state.auth.user?.id);
  const [selectionMap, setSelectionMap] = useState(() => Object.fromEntries(initialSelections.map(selection => [selection.vendorId, selection.codes])));
  const vendorIds = [...new Set(items.map(item => item.productVariant?.productColor?.product?.vendorId || 'platform'))];
  const selections = vendorIds.map(vendorId => ({ vendorId, codes: selectionMap[vendorId] || [] }));
  const payload = { cartItemIds: items.map(item => item.id), voucherCodes: [], voucherSelections: selections };
  const fingerprint = items.map(item => `${item.id}:${item.quantity}:${item.productVariant?.price}`).join('|');
  const query = useQuery({
    queryKey: ['checkout-preview', userId, fingerprint, JSON.stringify(selections)],
    queryFn: () => voucherService.previewCheckout(payload),
    enabled: Boolean(userId) && items.length > 0 && enabled,
    retry: false,
    refetchInterval: 30000,
  });
  const data = query.isError ? null : query.data;
  return {
    selections, payload, data, loading: query.isFetching || (items.length > 0 && query.isPending),
    ready: Boolean(data) && !query.isFetching && !query.isError,
    error: query.error?.response?.data?.errors?.[0]?.message || query.error?.response?.data?.message || (query.isError ? 'Không tính được giá. Vui lòng thử lại.' : ''),
    setCodes: (vendorId, codes) => setSelectionMap(current => ({ ...current, [vendorId]: codes })),
    refresh: query.refetch,
  };
}
