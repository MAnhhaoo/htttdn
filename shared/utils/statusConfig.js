/**
 * Từ điển nhãn Tiếng Việt & Badge Variant chuẩn hóa cho toàn bộ trạng thái hệ thống.
 */

export const ORDER_STATUS_META = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  processing: { label: 'Đang đóng gói', variant: 'purple' },
  ready_for_pickup: { label: 'Chờ bưu tá lấy', variant: 'info' },
  shipping: { label: 'Đang giao hàng', variant: 'info' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'error' },
  mixed: { label: 'Nhiều trạng thái', variant: 'info' },
};

export const SHIPMENT_STATUS_META = {
  pending: { label: 'Chờ phân phối', variant: 'default' },
  assigned: { label: 'Đã phân công bưu tá', variant: 'info' },
  picking_up: { label: 'Đang lấy hàng', variant: 'warning' },
  in_transit: { label: 'Đang trung chuyển', variant: 'info' },
  out_for_delivery: { label: 'Đang đi giao', variant: 'purple' },
  delivered: { label: 'Giao thành công', variant: 'success' },
  failed: { label: 'Giao thất bại', variant: 'error' },
  returned: { label: 'Đã hoàn hàng về kho', variant: 'warning' },
};

export const VOUCHER_STATUS_META = {
  active: { label: 'Đang hoạt động', variant: 'success' },
  draft: { label: 'Bản nháp', variant: 'default' },
  inactive: { label: 'Tạm dừng', variant: 'warning' },
  expired: { label: 'Hết hạn', variant: 'error' },
};

export const SURVEY_STATUS_META = {
  active: { label: 'Đang khảo sát', variant: 'success' },
  draft: { label: 'Bản nháp', variant: 'default' },
  paused: { label: 'Tạm dừng', variant: 'warning' },
  closed: { label: 'Đã đóng', variant: 'error' },
};

export function getOrderStatusLabel(status) {
  return ORDER_STATUS_META[status]?.label || status || '—';
}

export function getOrderStatusBadgeVariant(status) {
  return ORDER_STATUS_META[status]?.variant || 'default';
}

export function getShipmentStatusText(status) {
  return SHIPMENT_STATUS_META[status]?.label || status || '—';
}

export function getShipmentBadgeVariant(status) {
  return SHIPMENT_STATUS_META[status]?.variant || 'default';
}

