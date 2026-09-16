export const formatPrice = (price) => {
  if (typeof price !== 'number') return price;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};
