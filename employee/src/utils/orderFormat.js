// Map real backend order to employee UI representation
export const formatOrder = (item) => {
  if (!item) return null;

  // Collect all real vendors from order details and vendorOrders
  const orderVendorsMap = new Map();

  (item.details || []).forEach((d) => {
    const v = d.productVariant?.productColor?.product?.vendor;
    const vId = v?.id || d.productVariant?.productColor?.product?.vendorId;
    if (vId && !orderVendorsMap.has(vId)) {
      orderVendorsMap.set(vId, {
        id: vId,
        name: v?.storeName || v?.fullName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
        storeName: v?.storeName || v?.fullName || `Gian hàng đối tác`,
        code: `VND-${vId.slice(0, 6).toUpperCase()}`,
        phone: v?.phone || '0900000000',
        region: v?.address || 'Kho hàng đối tác MIVA',
        slaHours: 12,
        avatarUrl: v?.avatarUrl,
      });
    }
  });

  (item.vendorOrders || []).forEach((vo) => {
    const v = vo.vendor;
    const vId = v?.id || vo.vendorId;
    if (vId && !orderVendorsMap.has(vId)) {
      orderVendorsMap.set(vId, {
        id: vId,
        name: v?.storeName || v?.fullName || `Gian hàng đối tác (${vId.slice(0, 8)})`,
        storeName: v?.storeName || v?.fullName || `Gian hàng đối tác`,
        code: vo.vendorOrderCode || `VND-${vId.slice(0, 6).toUpperCase()}`,
        phone: v?.phone || '0900000000',
        region: v?.address || 'Kho hàng đối tác MIVA',
        slaHours: 12,
        avatarUrl: v?.avatarUrl,
      });
    }
  });

  const orderVendors = Array.from(orderVendorsMap.values());
  const primaryVendor = orderVendors[0] || null;

  const assignedVendor = primaryVendor
    ? {
        ...primaryVendor,
        vendorStatus:
          item.status === 'processing'
            ? 'Đang chuẩn bị kiện hàng'
            : item.status === 'shipping'
            ? 'Đã bàn giao vận chuyển'
            : 'Đang xử lý xuất kho',
        transferredAt: item.updatedAt,
        slaDeadline: new Date(new Date(item.createdAt).getTime() + 24 * 3600 * 1000).toISOString(),
      }
    : null;

  // Region inference
  const address = (item.shippingAddress || '').toLowerCase();
  const region =
    address.includes('hà nội') || address.includes('hải phòng') || address.includes('bắc')
      ? 'region_north'
      : address.includes('đà nẵng') || address.includes('huế') || address.includes('nha trang')
      ? 'region_central'
      : 'region_south';

  return {
    id: item.id,
    orderCode: item.orderCode,
    clientId: item.clientId,
    receiverName: item.receiverName || 'Khách hàng',
    receiverPhone: item.receiverPhone || '0900000000',
    shippingAddress: item.shippingAddress || 'Việt Nam',
    region: region,
    status: item.status,
    subtotalAmount: Number(item.subtotalAmount) || 0,
    discountAmount: Number(item.discountAmount) || 0,
    shippingFee: Number(item.shippingFee) || 0,
    totalAmount: Number(item.totalAmount) || 0,
    paymentMethod: item.payment?.method || 'cod',
    paymentStatus: item.payment?.status || 'pending',
    notes: item.notes || '',
    createdAt: item.createdAt,
    orderVendors: orderVendors,
    assignedVendor: assignedVendor,
    vendorSlaDeadline: assignedVendor?.slaDeadline || null,
    shipments: item.shipments || [],
    handlingEmployee:
      item.statusHistory?.find(
        (h) => h.employee && h.employee?.department?.includes('Điều phối'),
      )?.employee || null,
    assignedCarrier:
      item.shipments?.find((s) => s.carrier)?.carrier ||
      item.statusHistory
        ?.slice()
        .reverse()
        .find(
          (h) =>
            h.employee &&
            (h.employee?.department?.includes('Vận chuyển') ||
              h.employee?.department?.includes('Giao nhận')),
        )?.employee ||
      null,
    exceptionEmployee:
      item.statusHistory
        ?.slice()
        .reverse()
        .find((h) => h.employee && h.employee?.department?.includes('Sự cố'))?.employee || null,
    exception: (() => {
      const hasIncidentHistory = item.statusHistory?.some(
        (h) =>
          h.note?.includes('[Sự cố') ||
          h.note?.includes('[Chuyển Ban Xử lý Sự cố]') ||
          h.note?.includes('[Chuyển tiếp Admin]') ||
          h.note?.includes('[Xử lý sự cố'),
      );
      const hasFailedShipment = item.shipments?.some(
        (s) => s.status === 'failed' || s.status === 'returned',
      );
      const isCancelled = item.status === 'cancelled';
      const excEmp = item.statusHistory
        ?.slice()
        .reverse()
        .find((h) => h.employee && h.employee?.department?.includes('Sự cố'))?.employee;

      if (hasIncidentHistory || hasFailedShipment || isCancelled || excEmp) {
        return {
          type: isCancelled
            ? 'ORDER_CANCELLED'
            : hasFailedShipment
            ? 'DELIVERY_FAILED'
            : 'ORDER_INCIDENT',
          title: isCancelled
            ? 'Đơn hàng đã bị hủy / Cần xử lý hoàn'
            : hasFailedShipment
            ? 'Sự cố vận đơn / Giao hàng thất bại'
            : 'Sự cố phát sinh cần xử lý',
          severity: 'high',
          reportedBy: excEmp ? `${excEmp.fullName} (${excEmp.employeeCode})` : 'Hệ thống MIVA',
          status: isCancelled ? 'cancelled' : 'incident',
          suggestedAction: excEmp
            ? `Chuyên viên ${excEmp.fullName} (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) đang thụ lý`
            : 'Chuyển Bộ phận Xử lý Sự cố & Ngoại lệ Đơn xử lý',
        };
      }
      return null;
    })(),
    details:
      item.details?.map((d) => {
        const prod = d.productVariant?.productColor?.product;
        const vend = prod?.vendor;
        return {
          id: d.id,
          productName: d.productName || prod?.name || 'Sản phẩm',
          vendorId: vend?.id || prod?.vendorId || null,
          vendorName: vend?.storeName || vend?.fullName || 'Gian hàng đối tác',
          colorName: d.colorName || d.productVariant?.productColor?.color || 'Màu tiêu chuẩn',
          sizeName: d.sizeName || d.productVariant?.size || 'Freesize',
          quantity: d.quantity || 1,
          price: Number(d.price) || 0,
          imageUrl:
            d.imageUrl ||
            d.productVariant?.productColor?.imageUrls?.[0] ||
            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60',
        };
      }) || [],
    statusHistory:
      item.statusHistory?.map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        actorRole: h.note?.includes('[Nhân viên')
          ? 'Nhân viên'
          : h.adminId
          ? 'Admin'
          : h.vendorId
          ? 'Vendor'
          : h.clientId
          ? 'Khách hàng'
          : 'Hệ thống',
        actorName: h.note?.includes('[Nhân viên') ? 'Nhân viên xử lý' : 'Thành viên hệ thống',
        note: h.note || '',
        createdAt: h.createdAt,
      })) || [],
  };
};
