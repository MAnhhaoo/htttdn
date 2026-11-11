import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { voucherService } from '../services/voucherService';

export function useCheckoutPricing(items, initialSelections = [], enabled = true, initialPlatformCode = null) {
  const userId = useSelector(state => state.auth.user?.id);

  // Vendor codes mapping: { [vendorId]: string[] } (only vendor-scoped codes)
  const [vendorCodesMap, setVendorCodesMap] = useState(() => {
    const map = {};
    for (const sel of initialSelections || []) {
      if (sel.vendorId) {
        if (initialPlatformCode) {
          map[sel.vendorId] = (sel.codes || []).filter(c => c && c !== initialPlatformCode);
        } else if (sel.codes && sel.codes.length > 1) {
          map[sel.vendorId] = [sel.codes[0]];
        } else {
          map[sel.vendorId] = sel.codes || [];
        }
      }
    }
    return map;
  });

  // Platform code: string | null
  const [platformCode, setPlatformCodeState] = useState(() => {
    if (initialPlatformCode) return initialPlatformCode;
    for (const sel of initialSelections || []) {
      if (sel.codes && sel.codes.length > 1) {
        return sel.codes[1];
      }
    }
    return null;
  });

  // Calculate vendor subtotals to determine optimal target vendor for platform voucher
  const vendorSubtotals = useMemo(() => {
    const totals = {};
    for (const item of items) {
      const vId = item.productVariant?.productColor?.product?.vendorId || 'platform';
      const price = Number(item.productVariant?.price || 0) * (item.quantity || 1);
      totals[vId] = (totals[vId] || 0) + price;
    }
    return totals;
  }, [items]);

  const vendorIds = useMemo(() => {
    return [...new Set(items.map(item => item.productVariant?.productColor?.product?.vendorId || 'platform'))];
  }, [items]);

  // Target vendor for the platform voucher: the vendor with the highest subtotal
  const targetPlatformVendorId = useMemo(() => {
    if (!vendorIds.length) return null;
    let bestVendorId = vendorIds[0];
    let maxSubtotal = -1;
    for (const vId of vendorIds) {
      const subtotal = vendorSubtotals[vId] || 0;
      if (subtotal > maxSubtotal) {
        maxSubtotal = subtotal;
        bestVendorId = vId;
      }
    }
    return bestVendorId;
  }, [vendorIds, vendorSubtotals]);

  // Combine vendor codes and platform code into selections
  const selections = useMemo(() => {
    return vendorIds.map(vendorId => {
      const vCodes = (vendorCodesMap[vendorId] || []).filter(c => c && c !== platformCode);
      const codes = [...vCodes];
      if (platformCode && vendorId === targetPlatformVendorId) {
        codes.push(platformCode);
      }
      return { vendorId, codes };
    });
  }, [vendorIds, vendorCodesMap, platformCode, targetPlatformVendorId]);

  const payload = useMemo(() => ({
    cartItemIds: items.map(item => item.id),
    voucherCodes: platformCode ? [platformCode] : [],
    voucherSelections: selections,
  }), [items, platformCode, selections]);

  const fingerprint = items.map(item => `${item.id}:${item.quantity}:${item.productVariant?.price}`).join('|');

  const query = useQuery({
    queryKey: ['checkout-preview', userId, fingerprint, JSON.stringify(selections), platformCode],
    queryFn: () => voucherService.previewCheckout(payload),
    enabled: Boolean(userId) && items.length > 0 && enabled,
    retry: false,
    refetchInterval: 30000,
  });

  const data = query.isError ? null : query.data;

  const setVendorCodes = (vendorId, codes) => {
    const list = Array.isArray(codes) ? codes : (codes ? [codes] : []);
    const normalized = list.map(c => c.trim().toUpperCase()).filter(Boolean);
    setVendorCodesMap(current => ({ ...current, [vendorId]: normalized }));
  };

  const setPlatformCode = (code) => {
    const normalized = code ? code.trim().toUpperCase() : null;
    setPlatformCodeState(normalized);
  };

  const removePlatformCode = () => {
    setPlatformCodeState(null);
  };

  const setCodes = (vendorId, codes) => {
    setVendorCodes(vendorId, codes);
  };

  return {
    selections,
    payload,
    data,
    loading: query.isFetching || (items.length > 0 && query.isPending),
    ready: Boolean(data) && !query.isFetching && !query.isError,
    error: query.error?.response?.data?.errors?.[0]?.message || query.error?.response?.data?.message || (query.isError ? 'Không tính được giá. Vui lòng thử lại.' : ''),
    platformCode,
    targetPlatformVendorId,
    vendorCodesMap,
    setVendorCodes,
    setPlatformCode,
    removePlatformCode,
    setCodes,
    refresh: query.refetch,
  };
}
