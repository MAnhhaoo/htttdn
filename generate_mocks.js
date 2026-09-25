const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'admin', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. Users
const mockUsers = `
export const mockUsers = [
  { id: 1, fullName: "Admin System", email: "admin@example.com", password: "mock-password", address: "Hanoi", role: "admin", status: "active", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null, phone: "0900000001", createdBy: null },
  { id: 2, fullName: "Manager", email: "manager@example.com", password: "mock-password", address: "Hanoi", role: "admin", status: "active", createdAt: "2026-01-02T08:00:00", updatedAt: "2026-01-02T08:00:00", deletedAt: null, phone: "0900000002", createdBy: null },
  { id: 3, fullName: "Nike Official", email: "nike@vendor.com", password: "mock-password", address: "HCM", role: "seller", status: "active", createdAt: "2026-02-01T08:00:00", updatedAt: "2026-02-01T08:00:00", deletedAt: null, phone: "0911111111", createdBy: null },
  { id: 4, fullName: "Adidas Store", email: "adidas@vendor.com", password: "mock-password", address: "Da Nang", role: "seller", status: "active", createdAt: "2026-02-05T08:00:00", updatedAt: "2026-02-05T08:00:00", deletedAt: null, phone: "0922222222", createdBy: null },
  { id: 5, fullName: "Puma Vietnam", email: "puma@vendor.com", password: "mock-password", address: "Hanoi", role: "seller", status: "active", createdAt: "2026-02-10T08:00:00", updatedAt: "2026-02-10T08:00:00", deletedAt: null, phone: "0933333333", createdBy: null },
  { id: 6, fullName: "John Doe", email: "john@example.com", password: "mock-password", address: "Hanoi", role: "customer", status: "active", createdAt: "2026-03-01T08:00:00", updatedAt: "2026-03-01T08:00:00", deletedAt: null, phone: "0988888881", createdBy: null },
  { id: 7, fullName: "Jane Smith", email: "jane@example.com", password: "mock-password", address: "HCM", role: "customer", status: "active", createdAt: "2026-03-02T08:00:00", updatedAt: "2026-03-02T08:00:00", deletedAt: null, phone: "0988888882", createdBy: null },
  { id: 8, fullName: "Alice Johnson", email: "alice@example.com", password: "mock-password", address: "Da Nang", role: "customer", status: "active", createdAt: "2026-03-03T08:00:00", updatedAt: "2026-03-03T08:00:00", deletedAt: null, phone: "0988888883", createdBy: null },
  { id: 9, fullName: "Bob Brown", email: "bob@example.com", password: "mock-password", address: "Can Tho", role: "customer", status: "inactive", createdAt: "2026-03-04T08:00:00", updatedAt: "2026-03-04T08:00:00", deletedAt: null, phone: "0988888884", createdBy: null },
  { id: 10, fullName: "Charlie Davis", email: "charlie@example.com", password: "mock-password", address: "Hai Phong", role: "customer", status: "active", createdAt: "2026-03-05T08:00:00", updatedAt: "2026-03-05T08:00:00", deletedAt: null, phone: "0988888885", createdBy: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockUsers.js'), mockUsers);

// 2. Categories
const mockCategories = `
export const mockCategories = [
  { id: 1, name: "Sneakers", slug: "sneakers", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null },
  { id: 2, name: "Running Shoes", slug: "running-shoes", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null },
  { id: 3, name: "Basketball Shoes", slug: "basketball-shoes", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null },
  { id: 4, name: "Lifestyle", slug: "lifestyle", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null },
  { id: 5, name: "Sandals", slug: "sandals", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00", deletedAt: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockCategories.js'), mockCategories);

// 3. Products
const mockProducts = `
export const mockProducts = [
  { id: 101, categoryId: 1, name: "Nike Air Force 1 '07", slug: "nike-air-force-1-07", description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.", status: "active", createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 102, categoryId: 2, name: "Nike Pegasus 40", slug: "nike-pegasus-40", description: "A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals.", status: "active", createdAt: "2026-03-11T08:00:00", updatedAt: "2026-03-11T08:00:00", deletedAt: null },
  { id: 103, categoryId: 1, name: "Adidas Stan Smith", slug: "adidas-stan-smith", description: "Timeless appeal. Effortless style. Everyday versatility.", status: "active", createdAt: "2026-03-12T08:00:00", updatedAt: "2026-03-12T08:00:00", deletedAt: null },
  { id: 104, categoryId: 2, name: "Adidas Ultraboost Light", slug: "adidas-ultraboost-light", description: "Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever.", status: "active", createdAt: "2026-03-13T08:00:00", updatedAt: "2026-03-13T08:00:00", deletedAt: null },
  { id: 105, categoryId: 4, name: "Puma Suede Classic", slug: "puma-suede-classic", description: "The Suede has been changing the game since 1968.", status: "active", createdAt: "2026-03-14T08:00:00", updatedAt: "2026-03-14T08:00:00", deletedAt: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockProducts.js'), mockProducts);

// 4. Product Colors
const mockProductColors = `
export const mockProductColors = [
  { id: 1001, productId: 101, color: "White", imageUrls: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&q=80"], createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 1002, productId: 101, color: "Black", imageUrls: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"], createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 1003, productId: 102, color: "Blue", imageUrls: ["https://images.unsplash.com/photo-1605340537586-0a5d20245a16?w=500&q=80"], createdAt: "2026-03-11T08:00:00", updatedAt: "2026-03-11T08:00:00", deletedAt: null },
  { id: 1004, productId: 103, color: "White/Green", imageUrls: ["https://images.unsplash.com/photo-1621315271922-86111be1bc04?w=500&q=80"], createdAt: "2026-03-12T08:00:00", updatedAt: "2026-03-12T08:00:00", deletedAt: null },
  { id: 1005, productId: 104, color: "Black", imageUrls: ["https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=500&q=80"], createdAt: "2026-03-13T08:00:00", updatedAt: "2026-03-13T08:00:00", deletedAt: null },
  { id: 1006, productId: 105, color: "Red", imageUrls: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"], createdAt: "2026-03-14T08:00:00", updatedAt: "2026-03-14T08:00:00", deletedAt: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockProductColors.js'), mockProductColors);

// 5. Product Variants
const mockProductVariants = `
export const mockProductVariants = [
  { id: 10001, productColorId: 1001, size: "40", stock: 15, price: 2900000, createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 10002, productColorId: 1001, size: "41", stock: 10, price: 2900000, createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 10003, productColorId: 1001, size: "42", stock: 5, price: 2900000, createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 10004, productColorId: 1002, size: "40", stock: 8, price: 2950000, createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 10005, productColorId: 1002, size: "42", stock: 0, price: 2950000, createdAt: "2026-03-10T08:00:00", updatedAt: "2026-03-10T08:00:00", deletedAt: null },
  { id: 10006, productColorId: 1003, size: "41", stock: 20, price: 3200000, createdAt: "2026-03-11T08:00:00", updatedAt: "2026-03-11T08:00:00", deletedAt: null },
  { id: 10007, productColorId: 1004, size: "40", stock: 25, price: 2500000, createdAt: "2026-03-12T08:00:00", updatedAt: "2026-03-12T08:00:00", deletedAt: null },
  { id: 10008, productColorId: 1005, size: "42", stock: 12, price: 4500000, createdAt: "2026-03-13T08:00:00", updatedAt: "2026-03-13T08:00:00", deletedAt: null },
  { id: 10009, productColorId: 1006, size: "39", stock: 30, price: 1800000, createdAt: "2026-03-14T08:00:00", updatedAt: "2026-03-14T08:00:00", deletedAt: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockProductVariants.js'), mockProductVariants);

// 6. Carts
const mockCarts = `
export const mockCarts = [
  { id: 1, userId: 6, createdAt: "2026-04-01T08:00:00", updatedAt: "2026-04-01T08:00:00", deletedAt: null }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockCarts.js'), mockCarts);

// 7. Cart Items
const mockCartItems = `
export const mockCartItems = [
  { id: 1, productVariantId: 10001, cartId: 1, quantity: 1 }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockCartItems.js'), mockCartItems);

// 8. Orders
const mockOrders = `
export const mockOrders = [
  { id: 5001, userId: 6, totalAmount: 5800000, status: "completed", notes: "Please deliver in the morning", createdAt: "2026-04-10T10:00:00" },
  { id: 5002, userId: 7, totalAmount: 3200000, status: "pending", notes: "", createdAt: "2026-05-01T14:30:00" },
  { id: 5003, userId: 8, totalAmount: 4500000, status: "shipping", notes: "Leave at door", createdAt: "2026-05-15T09:15:00" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockOrders.js'), mockOrders);

// 9. Order Details
const mockOrderDetails = `
export const mockOrderDetails = [
  { id: 50011, orderId: 5001, productVariantId: 10001, quantity: 2, price: 2900000 },
  { id: 50021, orderId: 5002, productVariantId: 10006, quantity: 1, price: 3200000 },
  { id: 50031, orderId: 5003, productVariantId: 10008, quantity: 1, price: 4500000 }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockOrderDetails.js'), mockOrderDetails);

// 10. Payments
const mockPayments = `
export const mockPayments = [
  { id: 6001, orderId: 5001, method: "momo" },
  { id: 6002, orderId: 5002, method: "cod" },
  { id: 6003, orderId: 5003, method: "vnpay" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockPayments.js'), mockPayments);

// 11. Reviews
const mockReviews = `
export const mockReviews = [
  { id: 7001, userId: 6, productId: 101, orderDetailId: 50011, content: "Great shoes! Very comfortable.", rating: 5, createdAt: "2026-04-15T08:00:00", updatedAt: "2026-04-15T08:00:00" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockReviews.js'), mockReviews);

// 12. Vouchers
const mockVouchers = `
export const mockVouchers = [
  { id: 8001, userId: 3, code: "SUMMER10", name: "Summer Sale 10%", discountType: "percentage", discountValue: 10, minOrderAmount: 1000000, maxDiscountAmount: 500000, quantity: 100, usedQuantity: 15, startDate: "2026-06-01T00:00:00", endDate: "2026-06-30T23:59:59", status: "active", createdAt: "2026-05-20T08:00:00", updatedAt: "2026-05-20T08:00:00" },
  { id: 8002, userId: 4, code: "WELCOME200", name: "Welcome -200k", discountType: "fixed_amount", discountValue: 200000, minOrderAmount: 2000000, maxDiscountAmount: 200000, quantity: 50, usedQuantity: 50, startDate: "2026-01-01T00:00:00", endDate: "2026-12-31T23:59:59", status: "inactive", createdAt: "2026-01-01T08:00:00", updatedAt: "2026-01-01T08:00:00" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockVouchers.js'), mockVouchers);

// 13. Voucher Details
const mockVoucherDetails = `
export const mockVoucherDetails = [
  { id: 80011, voucherId: 8001, productId: 101, orderId: null, createdAt: "2026-05-20T08:00:00" },
  { id: 80012, voucherId: 8001, productId: 102, orderId: null, createdAt: "2026-05-20T08:00:00" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockVoucherDetails.js'), mockVoucherDetails);

// 14. Vendor Profiles (UI MOCK ONLY)
const mockVendorProfiles = `
// UI MOCK ONLY - NOT CURRENTLY IN DATABASE SCHEMA
export const mockVendorProfiles = [
  { userId: 3, storeName: "Nike Official Store", storeLogo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&q=80", storeBanner: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80", description: "Official Nike Distributor", businessName: "Nike Vietnam LLC", businessType: "Retail" },
  { userId: 4, storeName: "Adidas Flagship", storeLogo: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=100&q=80", storeBanner: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&q=80", description: "Original Adidas Products", businessName: "Adidas VN", businessType: "Retail" },
  { userId: 5, storeName: "Puma Authentic", storeLogo: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=100&q=80", storeBanner: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80", description: "Genuine Puma Gear", businessName: "Puma Southeast Asia", businessType: "Retail" }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockVendorProfiles.js'), mockVendorProfiles);

// 15. Vendor Product Mappings (UI MOCK ONLY)
const mockVendorProductMappings = `
// UI MOCK ONLY - Current database Product table does not yet contain vendor ownership.
export const mockVendorProductMappings = [
  { vendorId: 3, productId: 101 },
  { vendorId: 3, productId: 102 },
  { vendorId: 4, productId: 103 },
  { vendorId: 4, productId: 104 },
  { vendorId: 5, productId: 105 }
];
`;
fs.writeFileSync(path.join(dataDir, 'mockVendorProductMappings.js'), mockVendorProductMappings);

// 16. Index
const indexContent = [
  "export * from './mockUsers';",
  "export * from './mockCategories';",
  "export * from './mockProducts';",
  "export * from './mockProductColors';",
  "export * from './mockProductVariants';",
  "export * from './mockCarts';",
  "export * from './mockCartItems';",
  "export * from './mockOrders';",
  "export * from './mockOrderDetails';",
  "export * from './mockPayments';",
  "export * from './mockReviews';",
  "export * from './mockVouchers';",
  "export * from './mockVoucherDetails';",
  "export * from './mockVendorProfiles';",
  "export * from './mockVendorProductMappings';"
].join('\\n');
fs.writeFileSync(path.join(dataDir, 'index.js'), indexContent);

console.log("Mock data generated successfully in admin/src/data");
