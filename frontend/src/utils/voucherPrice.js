export function bestVoucherPrice(price, quantity, offers, productId, now = Date.now()) {
  const amount = Number(price) * quantity;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  let best = null;
  for (const offer of offers || []) {
    if (new Date(offer.startDate).getTime() > now || new Date(offer.endDate).getTime() < now) continue;
    if (offer.scope === 'vendor' && !offer.productIds?.includes(productId)) continue;
    if (Number(offer.minOrderAmount || 0) > amount) continue;
    let discount = offer.discountType === 'percentage' ? amount * Number(offer.discountValue) / 100 : Number(offer.discountValue);
    if (offer.maxDiscountAmount != null) discount = Math.min(discount, Number(offer.maxDiscountAmount));
    discount = Math.round(Math.min(amount, discount) * 100) / 100;
    if (discount > 0 && (!best || discount > best.discountAmount)) best = { ...offer, discountAmount: discount, totalAmount: amount - discount };
  }
  return best;
}
