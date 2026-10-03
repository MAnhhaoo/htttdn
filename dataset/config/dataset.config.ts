/**
 * Central configuration for the MIVA dataset generator.
 * Adjust counts here to scale the dataset up or down.
 */
export const CONFIG = {
  /** Deterministic random seed for reproducible output */
  fakerSeed: 42,

  /** Default password for all generated users */
  defaultPassword: 'admin123',

  /** Record counts */
  counts: {
    adminUsers: 5,
    vendorUsers: 25,
    customerUsers: 120,
    categories: 15,
    productsPerCategory: { min: 24, max: 35 },
    colorsPerProduct: { min: 1, max: 3 },
    variantsPerColor: { min: 2, max: 4 },
    platformVouchers: 20,
    vendorVouchers: 45,
    productsPerVendorVoucher: { min: 2, max: 4 },
    cartsToCreate: 100,
    cartItemsPerCart: { min: 1, max: 4 },
    orders: 800,
    orderItemsPerOrder: { min: 1, max: 4 },
    reviewsTarget: 400,
    adminSurveys: { min: 3, max: 5 },
    vendorSurveys: { min: 5, max: 10 },
    questionsPerSurvey: { min: 4, max: 8 },
    optionsPerChoice: { min: 3, max: 6 },
  },

  /** Order status distribution (must sum to 1.0) */
  orderStatusDistribution: {
    pending: 0.10,
    confirmed: 0.10,
    processing: 0.10,
    shipping: 0.15,
    completed: 0.45,
    cancelled: 0.10,
  } as Record<string, number>,

  /** Payment method distribution */
  paymentMethodDistribution: {
    cod: 0.40,
    vnpay: 0.20,
    momo: 0.15,
    zalopay: 0.10,
    bank_transfer: 0.15,
  } as Record<string, number>,

  /** Date range for generated timestamps */
  dateRange: {
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-09-30T00:00:00Z'),
  },
} as const;
