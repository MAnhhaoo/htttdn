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
    findFirst: jest.fn()
  };

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
      slug: 'shoes'
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
            deletedAt: null
          },
          {
            id: '66666666-6666-4666-8666-666666666666',
            productColorId: '44444444-4444-4444-8444-444444444444',
            stock: 2,
            size: 'L',
            price: new Prisma.Decimal('200'),
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            deletedAt: null
          },
        ]
      },
    ]
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
      itemPerPage: 10
    });

    expect(productDelegate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          status: ProductStatus.active,
          category: { deletedAt: null }
        }
      }),
    );
    expect(result.list[0]).toMatchObject({
      thumbnail: '/uploads/products/sneaker.webp',
      minPrice: '150.5',
      maxPrice: '200',
      totalStock: 5
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
          status: ProductStatus.inactive
        }
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
          category: { deletedAt: null }
        }
      }),
    );

    productDelegate.findFirst.mockResolvedValueOnce(null);
    await expect(service.getProductById(product.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('keeps sales from historical variants in the best-seller total', async () => {
    const db = {
      extended: {
        $queryRaw: jest.fn().mockResolvedValue([
          { productId: product.id, soldQty: 5 },
        ]),
        product: { findMany: jest.fn().mockResolvedValue([product]) },
      },
    };
    const bestSellers = new ProductService(
      db as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      { emitProductUpdated: jest.fn() } as unknown as RealtimeService,
    );

    const result = await bestSellers.getBestSellingProducts(1);

    expect(result[0]).toMatchObject({ id: product.id, soldQuantity: 5 });
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
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'new-color' }),
      },
      productVariant: {
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const productDelegate = { findFirst: jest.fn().mockResolvedValue({ id: productId }) };
    const prisma = {
      extended: { product: productDelegate },
      $transaction: jest.fn((callback: (client: typeof tx) => unknown) => callback(tx)),
    };
    Object.assign(prisma, { extendedTransaction: prisma.$transaction });
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

    expect(tx.productColor.findMany).toHaveBeenCalledWith({
      where: { productId },
      include: { variants: true },
    });
    expect(tx.productColor.update).not.toHaveBeenCalled();
  });

  it('rejects a variant id that does not belong to the color being updated', async () => {
    const { service, tx } = setup();
    tx.productColor.findMany.mockResolvedValue([
      {
        id: 'own-color',
        productId,
        color: 'Red',
        deletedAt: null,
        variants: [],
      },
    ]);

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

    expect(tx.productColor.findMany).toHaveBeenCalledWith({
      where: { productId },
      include: { variants: true },
    });
    expect(tx.productVariant.update).not.toHaveBeenCalled();
  });

  it('restores a soft-deleted size instead of violating the unique constraint', async () => {
    const { service, tx } = setup();
    tx.productColor.findMany.mockResolvedValue([
      {
        id: 'own-color',
        productId,
        color: 'Red',
        deletedAt: null,
        variants: [
          {
            id: 'old-variant',
            productColorId: 'own-color',
            size: 'S',
            deletedAt: new Date(),
          },
        ],
      },
    ]);

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

  it('lets the public list filter categories by UUID', async () => {
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

  it('enriches catalog products with soldQuantity from non-cancelled orders', async () => {
    const prodId = '33333333-3333-4333-8333-333333333333';
    const sampleProduct = {
      id: prodId,
      categoryId: '88888888-8888-4888-8888-888888888888',
      vendorId: '11111111-1111-4111-8111-111111111111',
      name: 'Sneaker',
      slug: 'sneaker',
      description: null,
      status: ProductStatus.active,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      deletedAt: null,
      category: { id: '88888888-8888-4888-8888-888888888888', name: 'Shoes', slug: 'shoes' },
      vendor: { id: '11111111-1111-4111-8111-111111111111', storeName: 'Shop A', address: 'Quận 1, TP. Hồ Chí Minh' },
      colors: [
        {
          id: '44444444-4444-4444-8444-444444444444',
          productId: prodId,
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
              price: new Prisma.Decimal('150000'),
              createdAt: new Date('2026-01-01T00:00:00.000Z'),
              updatedAt: new Date('2026-01-01T00:00:00.000Z'),
              deletedAt: null,
            },
          ],
        },
      ],
    };

    const delegate = {
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([sampleProduct]),
      findFirst: jest.fn().mockResolvedValue(sampleProduct),
    };
    const queryRaw = jest.fn().mockResolvedValue([{ productId: prodId, soldQuantity: 42n }]);
    const enrichedService = new ProductService(
      { extended: { product: delegate, $queryRaw: queryRaw } } as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      { emitProductUpdated: jest.fn() } as unknown as RealtimeService,
    );

    const detail = await enrichedService.getProductById(prodId);
    expect(detail.soldQuantity).toBe(42);
    expect((detail as any).vendor.address).toBe('Quận 1, TP. Hồ Chí Minh');

    const rawSqlArg = queryRaw.mock.calls[0][0];
    const sqlText = Array.isArray(rawSqlArg?.strings)
      ? rawSqlArg.strings.join('?')
      : String(rawSqlArg);
    expect(sqlText).not.toContain('deletedAt');
    expect(sqlText).toContain(`'cancelled'::"OrderStatus"`);

    queryRaw.mockRejectedValueOnce(new Error('DB transient failure'));
    const fallbackList = await enrichedService.getProducts({ page: 1, itemPerPage: 10 });
    expect(fallbackList.list).toHaveLength(1);
    expect(fallbackList.list[0].soldQuantity).toBe(0);
  });

  it('soft-deletes vendor product (hidden on UI, preserved in database) and frees its slug', async () => {
    const deleteMock = jest.fn();
    const updateMock = jest.fn().mockImplementation(async ({ data }) => ({
      id: productId,
      vendorId,
      ...data,
    }));
    const findFirstMock = jest.fn().mockResolvedValue({
      id: productId,
      slug: 'xit-khoang-aspasia',
    });
    const realtimeMock = { emitProductUpdated: jest.fn() };

    const softDeleteService = new ProductService(
      {
        extended: {
          product: {
            findFirst: findFirstMock,
            update: updateMock,
            delete: deleteMock,
          },
        },
      } as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      realtimeMock as unknown as RealtimeService,
    );

    const deleted = await softDeleteService.deleteProduct(productId, vendorId, false);

    expect(findFirstMock).toHaveBeenCalledWith({
      where: { id: productId, vendorId, deletedAt: null },
      select: { id: true, slug: true },
    });
    expect(deleteMock).not.toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: productId },
      data: expect.objectContaining({
        status: ProductStatus.inactive,
        deletedAt: expect.any(Date),
        slug: expect.stringMatching(/^xit-khoang-aspasia-deleted-\d+$/),
      }),
    });
    expect(deleted.deletedAt).toBeInstanceOf(Date);
    expect(deleted.status).toBe(ProductStatus.inactive);
    expect(realtimeMock.emitProductUpdated).toHaveBeenCalledWith(productId, vendorId);
  });

  it('soft-deletes removed colors and variants in syncColors without physical deletion', async () => {
    const { service, tx } = setup();
    tx.productColor.findMany.mockResolvedValue([
      {
        id: 'kept-color',
        productId,
        color: 'Black',
        deletedAt: null,
        variants: [
          { id: 'kept-var', productColorId: 'kept-color', size: 'S', deletedAt: null },
          { id: 'removed-var', productColorId: 'kept-color', size: 'M', deletedAt: null },
        ],
      },
      {
        id: 'removed-color',
        productId,
        color: 'White',
        deletedAt: null,
        variants: [
          { id: 'removed-color-var', productColorId: 'removed-color', size: 'L', deletedAt: null },
        ],
      },
    ]);

    await service.updateProduct(
      productId,
      {
        colors: [
          {
            id: 'kept-color',
            color: 'Black',
            imageUrls: [],
            variants: [{ id: 'kept-var', size: 'S', price: 120, stock: 4 }],
          },
        ],
      },
      vendorId,
    );

    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['removed-var'] } },
      data: { deletedAt: expect.any(Date) },
    });
    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({
      where: { productColorId: { in: ['removed-color'] }, deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(tx.productColor.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['removed-color'] } },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('soft-deletes and restores product favorites while preserving rows', async () => {
    const clientId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const favoriteDelegate = {
      upsert: jest.fn().mockResolvedValue({ id: 'fav-1', clientId, productId, deletedAt: null }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    };
    const productDelegateLocal = {
      findFirst: jest.fn().mockResolvedValue({
        id: productId,
        vendorId,
        status: ProductStatus.active,
        deletedAt: null,
        colors: [],
      }),
    };
    const favService = new ProductService(
      {
        extended: {
          product: productDelegateLocal,
          productFavorite: favoriteDelegate,
        },
      } as unknown as PrismaService,
      new PaginationUtilService(),
      new QueryUtilService(),
      new StringUtilService(),
      { emitProductUpdated: jest.fn() } as unknown as RealtimeService,
    );

    await favService.addFavorite(productId, clientId);
    expect(favoriteDelegate.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clientId_productId: { clientId, productId } },
        create: { clientId, productId },
        update: { deletedAt: null },
      }),
    );

    const removed = await favService.removeFavorite(productId, clientId);
    expect(removed).toEqual({ productId, favorited: false });
    expect(favoriteDelegate.updateMany).toHaveBeenCalledWith({
      where: { clientId, productId, deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });

    const status = await favService.favoriteStatus(productId, clientId);
    expect(status).toEqual({ productId, favorited: false });
    expect(favoriteDelegate.findFirst).toHaveBeenCalledWith({
      where: { clientId, productId, deletedAt: null },
      select: { id: true },
    });
  });
});
