/**
 * Central configuration for the MIVA dataset generator.
 * Adjust counts here to scale the dataset up or down.
 */
export const CONFIG = {
  /** Deterministic random seed for reproducible output */
  fakerSeed: 42,

  /** Default password for all generated users */
  defaultPassword: 'admin123',

  /** Record counts (compact dataset for easy manual verification) */
  counts: {
    adminUsers: 2,
    employeeUsers: 6,
    vendorUsers: 5,
    customerUsers: 10,
    categories: 6,
    productsPerCategory: { min: 3, max: 4 },
    colorsPerProduct: { min: 1, max: 2 },
    variantsPerColor: { min: 2, max: 3 },
    platformVouchers: 2,
    vendorVouchers: 3,
    productsPerVendorVoucher: { min: 2, max: 2 },
    cartsToCreate: 5,
    cartItemsPerCart: { min: 1, max: 2 },
    orders: 12,
    orderItemsPerOrder: { min: 1, max: 2 },
    reviewsTarget: 8,
    adminSurveys: { min: 2, max: 2 },
    vendorSurveys: { min: 1, max: 2 },
    questionsPerSurvey: { min: 2, max: 3 },
    optionsPerChoice: { min: 3, max: 4 },
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
