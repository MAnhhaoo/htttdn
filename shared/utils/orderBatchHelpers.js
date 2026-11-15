/**
 * Tiện ích gom nhóm Hóa đơn theo lượt Checkout (<= 60 giây) và đối chiếu tài chính
 * khi hủy một phần hoặc toàn bộ đơn hàng gộp — Dùng chung cho cả Admin và Storefront.
 */

export function computeBatchOrderFinancials(subOrders = []) {
  const list = Array.isArray(subOrders) ? subOrders : [];
  const activeSubs = list.filter((so) => so?.status !== 'cancelled');
  const cancelledSubs = list.filter((so) => so?.status === 'cancelled');

  const sumBy = (arr, getter) =>
    arr.reduce((s, item) => s + Number(getter(item) || 0), 0);

  const originalSubtotalAmount = sumBy(list, (so) => so.subtotalAmount ?? so.totalAmount);
  const originalDiscountAmount = sumBy(list, (so) => so.discountAmount);
  const originalShippingFee = sumBy(list, (so) => so.shippingFee);
  const originalTotalAmount = sumBy(list, (so) => so.totalAmount);

  const activeSubtotalAmount = sumBy(activeSubs, (so) => so.subtotalAmount ?? so.totalAmount);
  const activeDiscountAmount = sumBy(activeSubs, (so) => so.discountAmount);
  const activeShippingFee = sumBy(activeSubs, (so) => so.shippingFee);
  const activeTotalAmount = sumBy(activeSubs, (so) => so.totalAmount);
  const cancelledAmount = sumBy(cancelledSubs, (so) => so.totalAmount);

  const activeQty = activeSubs.reduce(
    (s, so) =>
      s + (so.details || []).reduce((acc, d) => acc + Number(d.quantity || 0), 0),
    0
  );
  const originalQty = list.reduce(
    (s, so) =>
      s + (so.details || []).reduce((acc, d) => acc + Number(d.quantity || 0), 0),
    0
  );

  return {
    totalSubCount: list.length,
    activeCount: activeSubs.length,
    cancelledCount: cancelledSubs.length,
    isPartiallyCancelled: cancelledSubs.length > 0 && activeSubs.length > 0,
    isAllCancelled: list.length > 0 && activeSubs.length === 0,
    originalSubtotalAmount,
    originalDiscountAmount,
    originalShippingFee,
    originalTotalAmount,
    activeSubtotalAmount,
    activeDiscountAmount,
    activeShippingFee,
    activeTotalAmount,
    cancelledAmount,
    activeQty,
    originalQty,
  };
}

export function groupOrdersByCheckoutBatch(rawOrders, options = {}) {
  if (!Array.isArray(rawOrders) || rawOrders.length === 0) return [];
  const { matchClientKey = true } = options;

  const groups = [];

  for (const order of rawOrders) {
    const clientKey = matchClientKey
      ? order.clientId ||
        order.client?.id ||
        order.client?.email ||
        `${order.receiverName || ''}_${order.receiverPhone || ''}`
      : 'single-client';
    const addressKey = (order.shippingAddress || '').trim().toLowerCase();
    const orderTime = new Date(order.createdAt).getTime();

    const existingGroup = groups.find((g) => {
      if (matchClientKey && g.clientKey !== clientKey) return false;
      if (matchClientKey) {
        if (g.addressKey !== addressKey) return false;
      } else if (g.addressKey && addressKey && g.addressKey !== addressKey) {
        return false;
      }
      const timeDiff = Math.abs(g.firstCreatedAtTime - orderTime);
      return timeDiff <= 60 * 1000;
    });

    if (existingGroup) {
      existingGroup.subOrders.push(order);
    } else {
      groups.push({
        groupId: order.id,
        clientKey,
        addressKey,
        firstCreatedAtTime: orderTime,
        subOrders: [order],
      });
    }
  }

  return groups.map((g) => {
    const subOrders = g.subOrders;
    const primary = subOrders[0];
    const financials = computeBatchOrderFinancials(subOrders);

    if (subOrders.length === 1) {
      return {
        ...primary,
        ...financials,
        isMergedGroup: false,
        subOrders: [primary],
      };
    }

    const mergedDetails = subOrders.flatMap((so) =>
      (so.details || []).map((d) => ({
        ...d,
        _subOrderId: so.id,
        _subOrderCode: so.orderCode || so.id,
      }))
    );

    const mergedVouchers = subOrders.flatMap((so) =>
      (so.voucherDetails || []).map((vd) => ({
        ...vd,
        _subOrderId: so.id,
        _subOrderCode: so.orderCode || so.id,
      }))
    );

    const allStatuses = subOrders.map((so) => so.status);
    const isAllSameStatus = allStatuses.every((s) => s === allStatuses[0]);
    const groupStatus = isAllSameStatus ? allStatuses[0] : 'mixed';

    return {
      ...primary,
      ...financials,
      isMergedGroup: true,
      subOrders,
      subtotalAmount: financials.activeSubtotalAmount,
      discountAmount: financials.activeDiscountAmount,
      shippingFee: financials.activeShippingFee,
      totalAmount: financials.activeTotalAmount,
      details: mergedDetails,
      voucherDetails: mergedVouchers,
      groupStatus,
    };
  });
}

