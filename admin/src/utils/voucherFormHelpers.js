/**
 * Các hàm dùng chung cho Form tạo & chỉnh sửa Voucher (Admin & Vendor).
 */

export function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function dateTimestamp(value, endOfDay, original) {
  // Giữ nguyên thời điểm gốc khi chỉnh sửa trường khác trên voucher đã tồn tại
  if (original && value === dateInputValue(original)) {
    return new Date(original).toISOString();
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function buildBaseVoucherPayload(formData, voucherToEdit) {
  return {
    code: formData.code.trim().toUpperCase(),
    name: formData.name.trim(),
    discountType: formData.discountType,
    discountValue: Number(formData.discountValue),
    quantity: Number(formData.quantity),
    perUserLimit: voucherToEdit?.perUserLimit ?? 1,
    startDate: dateTimestamp(formData.startDate, false, voucherToEdit?.startDate),
    endDate: dateTimestamp(formData.endDate, true, voucherToEdit?.endDate),
    status: formData.status,
  };
}

export function validateBaseVoucherPayload(payload) {
  if (payload.code.length < 3 || !payload.name) {
    throw new Error('Mã cần ít nhất 3 ký tự và tên voucher không được để trống.');
  }
  if (!Number.isFinite(payload.discountValue) || payload.discountValue <= 0) {
    throw new Error('Giá trị giảm phải lớn hơn 0.');
  }
  if (payload.discountType === 'percentage' && payload.discountValue > 100) {
    throw new Error('Phần trăm giảm không được vượt quá 100.');
  }
  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
    throw new Error('Số lượng voucher phải là số nguyên lớn hơn 0.');
  }
  if (payload.perUserLimit > payload.quantity) {
    throw new Error('Số lượng voucher không được nhỏ hơn giới hạn mỗi người.');
  }
  if (new Date(payload.endDate) <= new Date(payload.startDate)) {
    throw new Error('Ngày kết thúc phải sau thời điểm bắt đầu.');
  }
}

export function extractVoucherErrorMessage(err) {
  const data = err?.response?.data;
  const messages = data?.errors?.map((item) => item.message).filter(Boolean);
  return messages?.length
    ? messages.join(' ')
    : data?.message || err?.message || 'Lưu voucher thất bại.';
}
