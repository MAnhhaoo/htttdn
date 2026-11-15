/**
 * Kiểm tra một offer voucher có áp dụng cho sản phẩm cụ thể không (xét cả hạn dùng).
 */
export function isOfferApplicableToProduct(offer, productId, now = Date.now()) {
  if (!offer || !productId) return false;
  if (offer.startDate && new Date(offer.startDate).getTime() > now) return false;
  if (offer.endDate && new Date(offer.endDate).getTime() < now) return false;

  if (offer.scope === 'vendor') {
    return Array.isArray(offer.productIds) && offer.productIds.includes(productId);
  }
  if (offer.scope === 'platform') {
    return !offer.productIds?.length || offer.productIds.includes(productId);
  }
  return false;
}

/**
 * Tính mức giảm của 1 voucher theo đúng công thức Backend VouchersService.calculate().
 * - minOrderAmount luôn đối chiếu với originalEligible (giá gốc hợp lệ).
 * - discountBase lấy remaining (nếu toàn sàn) hoặc min(remaining, originalEligible) (nếu giới hạn SP/danh mục).
 */
export function calculateSingleVoucherStep(offer, originalEligible, remaining) {
  if (!offer || remaining <= 0 || originalEligible <= 0) return 0;
  const minOrder = Number(offer.minOrderAmount || 0);
  if (minOrder > originalEligible) return 0;

  const isAllPlatform =
    offer.scope === 'platform' && (!offer.productIds || offer.productIds.length === 0);
  const discountBase = isAllPlatform ? remaining : Math.min(remaining, originalEligible);

  let discount =
    offer.discountType === 'percentage'
      ? (discountBase * Number(offer.discountValue || 0)) / 100
      : Number(offer.discountValue || 0);

  if (offer.maxDiscountAmount != null && Number(offer.maxDiscountAmount) > 0) {
    discount = Math.min(discount, Number(offer.maxDiscountAmount));
  }

  discount = Math.min(discount, remaining, discountBase);
  return Math.round(Math.max(0, discount) * 100) / 100;
}

/**
 * Giữ hàm bestVoucherPrice đơn lẻ để tương thích ngược.
 */
export function bestVoucherPrice(price, quantity, offers, productId, now = Date.now()) {
  const amount = Number(price) * quantity;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  let best = null;
  for (const offer of offers || []) {
    if (!isOfferApplicableToProduct(offer, productId, now)) continue;
    const discount = calculateSingleVoucherStep(offer, amount, amount);
    if (discount > 0 && (!best || discount > best.discountAmount)) {
      best = { ...offer, discountAmount: discount, totalAmount: amount - discount };
    }
  }
  return best;
}

/**
 * Tính toán tổ hợp giảm giá tối ưu (1 Voucher Shop + 1 Voucher Admin Toàn Sàn)
 * khớp 100% thứ tự trừ lũy tiến ở Backend:
 *   Bước 1: Trừ Voucher Shop trên tổng tiền hàng gốc S -> còn lại R1 = S - D_shop
 *   Bước 2: Trừ Voucher Admin trên phần còn lại R1 (vẫn xét minOrderAmount trên S gốc)
 */
export function computeProductVoucherDeal(
  price,
  quantity = 1,
  offers = [],
  productId,
  options = {},
) {
  const now = options.now ?? Date.now();
  const unitPrice = Number(price) || 0;
  const qty = Math.max(1, Number(quantity) || 1);
  const originalTotal = Math.round(unitPrice * qty * 100) / 100;

  const applicableOffers = (offers || []).filter((offer) =>
    isOfferApplicableToProduct(offer, productId, now),
  );
  const shopOffers = applicableOffers.filter((o) => o.scope === 'vendor');
  const platformOffers = applicableOffers.filter((o) => o.scope === 'platform');

  if (!Number.isFinite(originalTotal) || originalTotal <= 0) {
    return {
      hasDiscount: false,
      originalUnitPrice: unitPrice,
      originalTotal: 0,
      totalAmount: 0,
      unitFinalPrice: unitPrice,
      discountAmount: 0,
      vendorDiscount: 0,
      platformDiscount: 0,
      discountPercent: 0,
      vendorOffer: null,
      platformOffer: null,
      shopOffers,
      platformOffers,
      applicableOffers,
      nextUnlockOffer: null,
    };
  }

  // Xác định danh sách ứng viên cho Bước 1 (Shop) và Bước 2 (Platform)
  let vendorCandidates;
  if (options.selectedVendorCode === null) {
    vendorCandidates = [null];
  } else if (typeof options.selectedVendorCode === 'string') {
    const picked = shopOffers.find((o) => o.code === options.selectedVendorCode) || null;
    vendorCandidates = [picked];
  } else {
    vendorCandidates = [null, ...shopOffers];
  }

  let platformCandidates;
  if (options.selectedPlatformCode === null) {
    platformCandidates = [null];
  } else if (typeof options.selectedPlatformCode === 'string') {
    const picked = platformOffers.find((o) => o.code === options.selectedPlatformCode) || null;
    platformCandidates = [picked];
  } else {
    platformCandidates = [null, ...platformOffers];
  }

  let bestCombo = {
    vendorOffer: null,
    platformOffer: null,
    vendorDiscount: 0,
    platformDiscount: 0,
    discountAmount: 0,
  };

  for (const vOffer of vendorCandidates) {
    const vDiscount = vOffer ? calculateSingleVoucherStep(vOffer, originalTotal, originalTotal) : 0;
    const effectiveVOffer = vDiscount > 0 ? vOffer : null;
    const remainingAfterShop = Math.max(0, Math.round((originalTotal - vDiscount) * 100) / 100);

    for (const pOffer of platformCandidates) {
      const pDiscount = pOffer
        ? calculateSingleVoucherStep(pOffer, originalTotal, remainingAfterShop)
        : 0;
      const effectivePOffer = pDiscount > 0 ? pOffer : null;
      const totalDiscount = Math.round((vDiscount + pDiscount) * 100) / 100;

      if (totalDiscount > bestCombo.discountAmount) {
        bestCombo = {
          vendorOffer: effectiveVOffer,
          platformOffer: effectivePOffer,
          vendorDiscount: vDiscount,
          platformDiscount: pDiscount,
          discountAmount: totalDiscount,
        };
      }
    }
  }

  const totalAmount = Math.max(0, Math.round((originalTotal - bestCombo.discountAmount) * 100) / 100);
  const unitFinalPrice = Math.round(totalAmount / qty);
  const discountPercent =
    bestCombo.discountAmount > 0
      ? Math.min(99, Math.max(1, Math.round((bestCombo.discountAmount / originalTotal) * 100)))
      : 0;

  // Tìm voucher gần chạm ngưỡng nhất nếu hiện tại chưa đủ minOrderAmount
  let nextUnlockOffer = null;
  for (const offer of applicableOffers) {
    const minOrder = Number(offer.minOrderAmount || 0);
    if (minOrder > originalTotal) {
      const shortfall = minOrder - originalTotal;
      if (!nextUnlockOffer || shortfall < nextUnlockOffer.shortfall) {
        nextUnlockOffer = {
          ...offer,
          shortfall,
          potentialDiscount: calculateSingleVoucherStep(offer, minOrder, minOrder),
        };
      }
    }
  }

  return {
    hasDiscount: bestCombo.discountAmount > 0,
    originalUnitPrice: unitPrice,
    originalTotal,
    totalAmount,
    unitFinalPrice,
    discountAmount: bestCombo.discountAmount,
    vendorDiscount: bestCombo.vendorDiscount,
    platformDiscount: bestCombo.platformDiscount,
    discountPercent,
    vendorOffer: bestCombo.vendorOffer,
    platformOffer: bestCombo.platformOffer,
    shopOffers,
    platformOffers,
    applicableOffers,
    nextUnlockOffer,
  };
}

/**
 * Đóng gói state truyền thẳng sang trang /checkout để tự động áp mã giảm giá.
 */
export function buildCheckoutVoucherState(deal, vendorId) {
  if (!deal?.hasDiscount) return {};
  const resolvedVendorId = vendorId || 'platform';
  return {
    voucherSelections: deal.vendorOffer
      ? [{ vendorId: resolvedVendorId, codes: [deal.vendorOffer.code] }]
      : [],
    platformVoucherCode: deal.platformOffer?.code || null,
  };
}

/**
 * Định dạng tiền rút gọn: 20000 -> "20k", 1500000 -> "1,5tr".
 */
export function formatCompactVnd(amount) {
  const n = Number(amount) || 0;
  if (n >= 1000000) {
    const millions = Math.round((n / 1000000) * 10) / 10;
    return `${String(millions).replace('.', ',')}tr`;
  }
  if (n >= 1000) {
    const thousands = Math.round((n / 1000) * 10) / 10;
    return `${String(thousands).replace('.', ',')}k`;
  }
  return `${Math.round(n)}`;
}

/**
 * Định dạng nhãn vé ngắn gọn: "Giảm 20k₫" hoặc "Giảm 15%".
 */
export function formatVoucherShortLabel(offer) {
  if (!offer) return '';
  if (offer.discountType === 'percentage') {
    return `Giảm ${Number(offer.discountValue)}%`;
  }
  return `Giảm ${formatCompactVnd(offer.discountValue)}₫`;
}

/**
 * Trích xuất Tỉnh / Thành phố của gian hàng từ địa chỉ hoặc tên shop.
 */
export function extractVendorLocation(vendor) {
  if (vendor?.address && typeof vendor.address === 'string') {
    const parts = vendor.address
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) {
      const last = parts[parts.length - 1];
      return last.replace(/^TP\.\s*/i, 'TP. ');
    }
  }
  if (vendor?.storeName) return vendor.storeName;
  if (vendor?.fullName) return vendor.fullName;
  return 'Toàn quốc';
}

/**
 * Định dạng lượt bán gọn đẹp: 85 -> "85", 1250 -> "1,2k+", 80000 -> "80k+".
 */
export function formatCompactSold(count) {
  const n = Number(count) || 0;
  if (n <= 0) return '0';
  if (n >= 1000) {
    const k = Math.floor((n / 1000) * 10) / 10;
    return `${String(k).replace('.', ',')}k+`;
  }
  return String(n);
}
