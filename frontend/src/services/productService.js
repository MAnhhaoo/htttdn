import { mockProducts } from '../mock/products.mock';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const productService = {
  getProducts: async () => {
    await delay(500);
    return { success: true, data: mockProducts };
  },
  getProductById: async (id) => {
    await delay(300);
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (product) return { success: true, data: product };
    throw new Error("Product not found");
  },
  getFlashDeals: async () => {
    await delay(400);
    return { success: true, data: mockProducts.filter(p => p.isFlashDeal) };
  }
};
