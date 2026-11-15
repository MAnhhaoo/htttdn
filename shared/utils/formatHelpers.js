/**
 * Thư viện hàm định dạng tiền tệ, ngày giờ và mã định danh dùng chung toàn hệ thống MIVA.
 */

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '0 ₫';
  }
  return vndFormatter.format(Number(amount));
}

// Alias tương thích cho các trang gọi formatPrice / formatVND
export const formatPrice = formatCurrency;
export const formatVND = formatCurrency;

export function formatCompactVND(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return '0 ₫';
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2).replace(/\.00$/, '')} tỷ ₫`;
  }
  if (abs >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} tr ₫`;
  }
  return formatCurrency(num);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return dateTimeFormatter.format(date);
}

export function formatDateOnly(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return dateOnlyFormatter.format(date);
}

export const formatDateTime = formatDate;

export function formatShortOrderCode(codeOrId, length = 6) {
  const raw = String(codeOrId || '').replace(/^#/, '').trim();
  if (!raw) return '—';
  return raw.length > length ? raw.slice(-length) : raw;
}

export function formatVendorCode(vendorId, existingCode) {
  if (existingCode) return existingCode;
  if (!vendorId) return 'VND-SYSTEM';
  return `VND-${String(vendorId).slice(0, 8).toUpperCase()}`;
}

export function addDaysToDateInput(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 0));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

