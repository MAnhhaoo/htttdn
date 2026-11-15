import { Prisma } from '@prisma/client';

export const VENDOR_SUMMARY_SELECT = {
  id: true,
  fullName: true,
  storeName: true,
  phone: true,
  avatarUrl: true,
  address: true,
} satisfies Prisma.VendorSelect;

export const CARRIER_SUMMARY_SELECT = {
  id: true,
  fullName: true,
  employeeCode: true,
  phone: true,
  department: true,
} satisfies Prisma.EmployeeSelect;

export const EMPLOYEE_ACTOR_SELECT = {
  id: true,
  fullName: true,
  employeeCode: true,
  department: true,
} satisfies Prisma.EmployeeSelect;

export const PRODUCT_VARIANT_SUMMARY_SELECT = {
  id: true,
  productColorId: true,
  size: true,
  stock: true,
  price: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  productColor: {
    select: {
      id: true,
      productId: true,
      color: true,
      imageUrls: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
      product: {
        select: {
          id: true,
          categoryId: true,
          vendorId: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          vendor: {
            select: VENDOR_SUMMARY_SELECT,
          },
        },
      },
    },
  },
} satisfies Prisma.ProductVariantSelect;

