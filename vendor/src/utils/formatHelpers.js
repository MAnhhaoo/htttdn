
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "0 ₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatShortOrderCode = (codeOrId, length = 6) => {
  const raw = String(codeOrId || '').replace(/^#/, '').trim();
  if (!raw) return '—';
  return raw.length > length ? raw.slice(-length) : raw;
};
