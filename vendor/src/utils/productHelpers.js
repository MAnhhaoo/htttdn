
import { mockProducts, mockProductColors, mockProductVariants, mockCategories, mockReviews } from '../data';

export const getProductById = (productId) => mockProducts.find(p => p.id === productId);

export const getProductColors = (productId) => mockProductColors.filter(c => c.productId === productId);

export const getVariantsByColor = (colorId) => mockProductVariants.filter(v => v.productColorId === colorId);

export const getProductVariants = (productId) => {
  const colors = getProductColors(productId);
  const colorIds = colors.map(c => c.id);
  return mockProductVariants.filter(v => colorIds.includes(v.productColorId));
};

export const getProductMinPrice = (productId) => {
  const variants = getProductVariants(productId);
  if (variants.length === 0) return 0;
  return Math.min(...variants.map(v => v.price));
};

export const getProductMaxPrice = (productId) => {
  const variants = getProductVariants(productId);
  if (variants.length === 0) return 0;
  return Math.max(...variants.map(v => v.price));
};

export const getProductPriceRange = (productId) => {
  const min = getProductMinPrice(productId);
  const max = getProductMaxPrice(productId);
  if (min === max) return `${min}`;
  return `${min} - ${max}`;
};

export const getProductTotalStock = (productId) => {
  const variants = getProductVariants(productId);
  return variants.reduce((sum, v) => sum + v.stock, 0);
};

export const getAvailableSizes = (productId) => {
  const variants = getProductVariants(productId);
  return [...new Set(variants.map(v => v.size))];
};

export const getAvailableColors = (productId) => {
  const colors = getProductColors(productId);
  return colors.map(c => c.color);
};

export const getProductImages = (productId) => {
  const colors = getProductColors(productId);
  const images = [];
  colors.forEach(c => images.push(...c.imageUrls));
  return images;
};

export const getProductCategory = (productId) => {
  const product = getProductById(productId);
  if (!product) return null;
  return mockCategories.find(c => c.id === product.categoryId);
};

export const getProductAverageRating = (productId) => {
  const reviews = mockReviews.filter(r => r.productId === productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
};
