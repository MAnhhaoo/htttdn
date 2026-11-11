/**
 * Tiện ích xử lý và gom nhóm đơn hàng cho Khách hàng
 */

export function getOrderStoreName(order) {
  return (
    order?.vendorOrders?.[0]?.vendor?.storeName ||
    order?.details?.[0]?.productVariant?.productColor?.product?.vendor?.storeName ||
    order?.details?.[0]?.product?.vendor?.storeName ||
    null
  );
}

/**
 * Gộp các đơn hàng được đặt cùng 1 lượt thanh toán (cùng lượt checkout,
 * cùng địa chỉ nhận, thời gian tạo cách nhau <= 60 giây) thành 1 Đơn hàng gộp.
 */
export function groupOrdersByCheckoutBatch(rawOrders) {
  if (!Array.isArray(rawOrders) || rawOrders.length === 0) return [];

  const groups = [];

  for (const order of rawOrders) {
    const addressKey = (order.shippingAddress || '').trim().toLowerCase();
    const orderTime = new Date(order.createdAt).getTime();

    // Tìm group có cùng địa chỉ nhận và thời gian tạo cách nhau <= 60s
    const existingGroup = groups.find((g) => {
      if (g.addressKey && addressKey && g.addressKey !== addressKey) return false;
      const timeDiff = Math.abs(g.firstCreatedAtTime - orderTime);
      return timeDiff <= 60 * 1000;
    });

    if (existingGroup) {
      existingGroup.subOrders.push(order);
    } else {
      groups.push({
        groupId: order.id,
        addressKey,
        firstCreatedAtTime: orderTime,
        subOrders: [order],
      });
    }
  }

  return groups.map((g) => {
    const subOrders = g.subOrders;
    const primary = subOrders[0];
    if (subOrders.length === 1) {
      return {
        ...primary,
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

    const mergedSubtotal = subOrders.reduce(
      (sum, so) => sum + Number(so.subtotalAmount ?? so.totalAmount ?? 0),
      0
    );
    const mergedDiscount = subOrders.reduce(
      (sum, so) => sum + Number(so.discountAmount || 0),
      0
    );
    const mergedShippingFee = subOrders.reduce(
      (sum, so) => sum + Number(so.shippingFee || 0),
      0
    );
    const mergedTotal = subOrders.reduce(
      (sum, so) => sum + Number(so.totalAmount || 0),
      0
    );

    const allStatuses = subOrders.map((so) => so.status);
    const isAllSameStatus = allStatuses.every((s) => s === allStatuses[0]);
    const groupStatus = isAllSameStatus ? allStatuses[0] : 'mixed';

    return {
      ...primary,
      isMergedGroup: true,
      subOrders,
      subtotalAmount: mergedSubtotal,
      discountAmount: mergedDiscount,
      shippingFee: mergedShippingFee,
      totalAmount: mergedTotal,
      details: mergedDetails,
      groupStatus,
    };
  });
}

export function formatShortOrderCode(codeOrId, length = 6) {
  const raw = String(codeOrId || '').replace(/^#/, '').trim();
  if (!raw) return '—';
  return raw.length > length ? raw.slice(-length) : raw;
}
