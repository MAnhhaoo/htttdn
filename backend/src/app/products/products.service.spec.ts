import { NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';

import { ProductService } from './products.service';

describe('ProductService', () => {
  const productDelegate = {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
  };

  const service = new ProductService(
    { extended: { product: productDelegate } } as unknown as PrismaService,
    new PaginationUtilService(),
    new QueryUtilService(),
    new StringUtilService(),
  );

  const product = {
    id: '33333333-3333-4333-8333-333333333333',
    categoryId: '88888888-8888-4888-8888-888888888888',
    vendorId: '11111111-1111-4111-8111-111111111111',
    name: 'Sneaker',
    slug: 'sneaker',
    description: null,
    status: ProductStatus.active,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    category: {
      id: '88888888-8888-4888-8888-888888888888',
      name: 'Shoes',
      slug: 'shoes',
    },
    colors: [
      {
        id: '44444444-4444-4444-8444-444444444444',
        productId: '33333333-3333-4333-8333-333333333333',
        color: 'Black',
        imageUrls: ['/uploads/products/sneaker.webp'],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        deletedAt: null,
        variants: [
          {
            id: '55555555-5555-4555-8555-555555555555',
            productColorId: '44444444-4444-4444-8444-444444444444',
            stock: 3,
            size: 'M',
            price: new Prisma.Decimal('150.50'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            deletedAt: null,
          },
          {
            id: '66666666-6666-4666-8666-666666666666',
            productColorId: '44444444-4444-4444-8444-444444444444',
            stock: 2,
            size: 'L',
            price: new Prisma.Decimal('200'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            deletedAt: null,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    productDelegate.count.mockResolvedValue(1);
    productDelegate.findMany.mockResolvedValue([product]);
    productDelegate.findFirst.mockResolvedValue(product);
  });

  it('returns only active public products with catalog summary fields', async () => {
    const result = await service.getProducts({
      page: 1,
      itemPerPage: 10,
    });

    expect(productDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
      }),
    );
    expect(result.list[0]).toMatchObject({
      thumbnail: '/uploads/products/sneaker.webp',
      minPrice: '150.5',
      maxPrice: '200',
      totalStock: 5,
    });
  });

  it('lets a vendor filter their own products by status', async () => {
    await service.getVendorProducts(
      { page: 1, itemPerPage: 10, status: ProductStatus.inactive },
      product.vendorId,
    );

    expect(productDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          vendorId: product.vendorId,
          status: ProductStatus.inactive,
        },
      }),
    );
  });

  it('requires an active product and active category for public detail', async () => {
    await service.getProductById(product.id);

    expect(productDelegate.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: product.id,
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null },
        },
      }),
    );

    productDelegate.findFirst.mockResolvedValueOnce(null);
    await expect(service.getProductById(product.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
