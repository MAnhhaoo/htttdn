import { Truck, Package, AlertTriangle } from 'lucide-react';

/**
 * Trích xuất nhân viên Điều phối, Bưu tá và Sự cố của một đơn hàng từ statusHistory & shipments.
 * Tái sử dụng chung giữa OrderManagement.jsx và OrderDetailModal.jsx.
 */
export function extractOrderEmployees(order) {
  const historyList = order?.statusHistory || [];
  const reversedHistory = [...historyList].reverse();

  const handlingHistory = reversedHistory.find(
    (h) =>
      h.employee &&
      (h.employee.department?.toLowerCase().includes('điều phối') ||
        h.employee.department?.toLowerCase().includes('vendor') ||
        h.note?.toLowerCase().includes('điều phối'))
  );
  const handlingEmp = handlingHistory?.employee || null;

  const directCarrier = order?.shipments?.find((s) => s.carrier)?.carrier;
  const shippingHistory = reversedHistory.find(
    (h) =>
      h.employee &&
      (h.employee.department?.toLowerCase().includes('vận chuyển') ||
        h.employee.department?.toLowerCase().includes('giao nhận') ||
        h.note?.toLowerCase().includes('bưu tá') ||
        h.note?.toLowerCase().includes('giao nhận'))
  );
  const shippingEmp = directCarrier || shippingHistory?.employee || null;

  const exceptionHistory = reversedHistory.find(
    (h) =>
      h.employee &&
      (h.employee.department?.toLowerCase().includes('sự cố') ||
        h.employee.department?.toLowerCase().includes('ngoại lệ') ||
        h.note?.toLowerCase().includes('sự cố') ||
        h.note?.toLowerCase().includes('khiếu nại') ||
        h.note?.toLowerCase().includes('tranh chấp'))
  );
  const exceptionEmp = exceptionHistory?.employee || null;

  const anyHistoryEmp = reversedHistory.find((h) => h.employee)?.employee || null;

  let displayEmp = null;
  let deptMeta = null;

  if (order?.status === 'cancelled') {
    displayEmp = exceptionEmp || handlingEmp || shippingEmp || anyHistoryEmp;
    deptMeta = {
      icon: AlertTriangle,
      deptName: 'Sự cố & Ngoại lệ',
      textColor: 'text-amber-700 dark:text-amber-400',
      iconColor: 'text-amber-600',
    };
  } else if (order?.status === 'shipping' || order?.status === 'completed') {
    displayEmp = shippingEmp || handlingEmp || anyHistoryEmp;
    deptMeta = {
      icon: Truck,
      deptName: 'Vận chuyển & Giao nhận',
      textColor: 'text-blue-700 dark:text-blue-400',
      iconColor: 'text-blue-600',
    };
  } else {
    displayEmp = handlingEmp || shippingEmp || anyHistoryEmp;
    deptMeta = {
      icon: Package,
      deptName: 'Điều phối & Vendor',
      textColor: 'text-indigo-700 dark:text-indigo-400',
      iconColor: 'text-indigo-600',
    };
  }

  return {
    displayEmp,
    shippingEmp,
    handlingEmp,
    exceptionEmp,
    deptMeta,
    handlingHistory,
    shippingHistory,
    exceptionHistory,
  };
}

/**
 * Phân loại danh sách nhân viên theo 3 phòng ban nghiệp vụ.
 */
export function categorizeEmployeesByDepartment(employees = []) {
  const handlingEmployees = [];
  const shippingEmployees = [];
  const exceptionEmployees = [];
  const otherEmployees = [];

  for (const e of employees) {
    const dept = (e.department || '').toLowerCase();
    if (dept.includes('điều phối') || dept.includes('vendor')) {
      handlingEmployees.push(e);
    } else if (dept.includes('vận chuyển') || dept.includes('giao nhận')) {
      shippingEmployees.push(e);
    } else if (dept.includes('sự cố') || dept.includes('ngoại lệ')) {
      exceptionEmployees.push(e);
    } else {
      otherEmployees.push(e);
    }
  }

  return {
    handlingEmployees,
    shippingEmployees,
    exceptionEmployees,
    otherEmployees,
  };
}

/**
 * Gộp các đơn hàng được đặt cùng 1 lượt thanh toán (cùng khách hàng, cùng địa chỉ nhận,
 * thời gian tạo cách nhau <= 60 giây) thành 1 dòng Hóa đơn tổng trên giao diện.
 */
export function groupOrdersByCheckoutBatch(rawOrders) {
  if (!Array.isArray(rawOrders) || rawOrders.length === 0) return [];

  const groups = [];

  for (const order of rawOrders) {
    const clientKey =
      order.clientId ||
      order.client?.id ||
      order.client?.email ||
      `${order.receiverName || ''}_${order.receiverPhone || ''}`;
    const addressKey = (order.shippingAddress || '').trim().toLowerCase();
    const orderTime = new Date(order.createdAt).getTime();

    const existingGroup = groups.find((g) => {
      if (g.clientKey !== clientKey) return false;
      if (g.addressKey !== addressKey) return false;
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
    const mergedVouchers = subOrders.flatMap((so) =>
      (so.voucherDetails || []).map((vd) => ({
        ...vd,
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

    return {
      ...primary,
      isMergedGroup: true,
      subOrders,
      subtotalAmount: mergedSubtotal,
      discountAmount: mergedDiscount,
      shippingFee: mergedShippingFee,
      totalAmount: mergedTotal,
      details: mergedDetails,
      voucherDetails: mergedVouchers,
    };
  });
}

export function getOrderStatusBadgeVariant(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'shipping':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

export function getShipmentBadgeVariant(status) {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'out_for_delivery':
    case 'in_transit':
      return 'info';
    case 'failed':
      return 'error';
    case 'returned':
      return 'warning';
    default:
      return 'default';
  }
}

export function getShipmentStatusText(status) {
  switch (status) {
    case 'delivered':
      return 'Giao thành công';
    case 'out_for_delivery':
      return 'Đang đi giao';
    case 'in_transit':
      return 'Đang trung chuyển';
    case 'failed':
      return 'Giao thất bại';
    case 'returned':
      return 'Đã hoàn hàng về kho';
    case 'picking_up':
      return 'Đang lấy hàng';
    case 'assigned':
      return 'Đã phân công bưu tá';
    case 'pending':
      return 'Chờ phân phối';
    default:
      return status;
  }
}
