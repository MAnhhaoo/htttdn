import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PaginationUtilService } from 'src/common/utils/paginaton-util/pagintion-util.service';
import { QueryUtilService } from 'src/common/utils/query-util/query-util.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';

import { RealtimeService } from '../realtime/realtime.service';
import { ProductService } from './products.service';

describe('ProductService', () => {
  const productDelegate = {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn()};

  const service = new ProductService(
    { extended: { product: productDelegate } } as unknown as PrismaService,
    new PaginationUtilService(),
    new QueryUtilService(),
    new StringUtilService(),
    { emitProductUpdated: jest.fn() } as unknown as RealtimeService,
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
      slug: 'shoes'},
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
            deletedAt: null},
          {
            id: '66666666-6666-4666-8666-666666666666',
            productColorId: '44444444-4444-4444-8444-444444444444',
            stock: 2,
            size: 'L',
            price: new Prisma.Decimal('200'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            deletedAt: null},
        ]},
    ]};

  beforeEach(() => {
    jest.clearAllMocks();
    productDelegate.count.mockResolvedValue(1);
    productDelegate.findMany.mockResolvedValue([product]);
    productDelegate.findFirst.mockResolvedValue(product);
  });

  it('returns only active public products with catalog summary fields', async () => {
    const result = await service.getProducts({
      page: 1,
      itemPerPage: 10});

    expect(productDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null }}}),
    );
    expect(result.list[0]).toMatchObject({
      thumbnail: '/uploads/products/sneaker.webp',
      minPrice: '150.5',
      maxPrice: '200',
      totalStock: 5});
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
          status: ProductStatus.inactive}}),
    );
  });

  it('keeps inactive and all-status filters in the admin product list', async () => {
    await service.getAdminProducts({ page: 1, itemPerPage: 10, status: ProductStatus.inactive });
    expect(productDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: ProductStatus.inactive }) }),
    );
    await service.getAdminProducts({ page: 1, itemPerPage: 10, status: 'all' });
    expect(productDelegate.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: expect.not.objectContaining({ status: expect.anything() }) }),
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
          category: { deletedAt: null }}}),
    );

    productDelegate.findFirst.mockResolvedValueOnce(null);
    await expect(service.getProductById(product.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

describe('ProductService â€“ ownership and shared rules', () => {
  const vendorId = '11111111-1111-4111-8111-111111111111';
  const productId = '33333333-3333-4333-8333-333333333333';
  const otherColorId = '99999999-9999-4999-8999-999999999999';
  const otherVariantId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  function setup() {
    const tx = {
      product: { update: jest.fn().mockResolvedValue({ id: productId, vendorId }) },
      productColor: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'new-color' }),
      },
      productVariant: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
        create: jest.fn(),
      },
    };
    const productDelegate = { findFirst: jest.fn().mockResolvedValue({ id: productId }) };
    const prisma = {
      extended: { product: productDelegate },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    const realtime = { emitProductUpdated: jest.fn() };
    const service = new ProductService(
      prisma as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      realtime as unknown as RealtimeService,
    );
    return { service, tx, productDelegate, realtime };
  }

  it('rejects a color id that does not belong to the product being updated', async () => {
    const { service, tx } = setup();

    await expect(
      service.updateProduct(
        productId,
        { colors: [{ id: otherColorId, color: 'Red', imageUrls: [], variants: [] }] },
        vendorId,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(tx.productColor.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: otherColorId, productId, deletedAt: null } }),
    );
    expect(tx.productColor.update).not.toHaveBeenCalled();
  });

  it('rejects a variant id that does not belong to the color being updated', async () => {
    const { service, tx } = setup();
    tx.productColor.findFirst.mockResolvedValue({ id: 'own-color' });

    await expect(
      service.updateProduct(
        productId,
        {
          colors: [
            {
              id: 'own-color',
              color: 'Red',
              imageUrls: [],
              variants: [{ id: otherVariantId, size: 'M', price: 1, stock: 1 }],
            },
          ],
        },
        vendorId,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(tx.productVariant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: otherVariantId, productColorId: 'own-color', deletedAt: null },
      }),
    );
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });

  it('restores a soft-deleted size instead of violating the unique constraint', async () => {
    const { service, tx } = setup();
    tx.productColor.findFirst.mockResolvedValue({ id: 'own-color' });
    tx.productVariant.findUnique.mockResolvedValue({ id: 'old-variant', deletedAt: new Date() });

    await service.updateProduct(
      productId,
      {
        colors: [
          { id: 'own-color', color: 'Red', imageUrls: [], variants: [{ size: 'S', price: 10, stock: 2 }] },
        ],
      },
      vendorId,
    );

    expect(tx.productVariant.create).not.toHaveBeenCalled();
    expect(tx.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'old-variant' },
      data: { deletedAt: null, price: 10, stock: 2 },
    });
  });

  it('runs the whole update in one transaction and rejects too many images', async () => {
    const { service, tx } = setup();
    const images = Array.from({ length: 21 }, (_, index) => `/uploads/products/${index}.png`);

    await expect(
      service.updateProduct(
        productId,
        { colors: [{ color: 'Red', imageUrls: images, variants: [] }] },
        vendorId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.productColor.create).not.toHaveBeenCalled();
  });

  it('lets the admin and the public list filter categories by UUID', async () => {
    const { service, productDelegate } = setup();
    const categoryId = '88888888-8888-4888-8888-888888888888';
    const delegate = { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) };
    const prisma = { extended: { product: delegate } };
    const listService = new ProductService(
      prisma as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      { emitProductUpdated: jest.fn() } as unknown as RealtimeService,
    );

    await listService.getAdminProducts({ page: 1, itemPerPage: 10, category: categoryId });
    await listService.getProducts({ page: 1, itemPerPage: 10, category: categoryId });

    for (const call of delegate.findMany.mock.calls) {
      expect(call[0].where.category).toEqual({
        OR: [{ slug: categoryId }, { id: categoryId }],
        deletedAt: null,
      });
    }
    expect(productDelegate.findFirst).not.toHaveBeenCalled();
    expect(service).toBeDefined();
  });
});
