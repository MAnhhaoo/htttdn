import { BadRequestException } from '@nestjs/common';
import {
  DiscountType,
  Prisma,
  ProductStatus,
  VoucherScope,
  VoucherStatus,
} from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { VouchersService } from './vouchers.service';

describe('VouchersService', () => {
  const vendorId = '11111111-1111-4111-8111-111111111111';
  const productId = '22222222-2222-4222-8222-222222222222';
  const anotherProductId = '33333333-3333-4333-8333-333333333333';

  const variant = (id: string, price: number, selectedProductId: string) => ({
    id,
    productColorId: `${id.slice(0, -1)}a`,
    stock: 10,
    size: 'M',
    price: new Prisma.Decimal(price),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    productColor: {
      id: `${id.slice(0, -1)}a`,
      productId: selectedProductId,
      color: 'Black',
      imageUrls: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      product: {
        id: selectedProductId,
        vendorId,
        categoryId: '44444444-4444-4444-8444-444444444444',
        name: 'Product',
        slug: selectedProductId,
        description: null,
        status: ProductStatus.active,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    },
  });

  const voucher = (
    id: string,
    code: string,
    scope: VoucherScope,
    discountType: DiscountType,
    discountValue: number,
  ) => ({
    id,
    userId: vendorId,
    code,
    name: code,
    scope,
    discountType,
    discountValue: new Prisma.Decimal(discountValue),
    minOrderAmount: null,
    maxDiscountAmount: null,
    quantity: 100,
    usedQuantity: 0,
    perUserLimit: 1,
    startDate: new Date(Date.now() - 60_000),
    endDate: new Date(Date.now() + 60_000),
    status: VoucherStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    details:
      scope === VoucherScope.vendor ? [{ productId, orderId: null }] : [],
  });

  it('applies vendor first, caps it to eligible products, then applies platform voucher', async () => {
    const db = {
      productVariant: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            variant('55555555-5555-4555-8555-555555555555', 20, productId),
            variant(
              '66666666-6666-4666-8666-666666666666',
              80,
              anotherProductId,
            ),
          ]),
      },
      voucher: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            voucher(
              '77777777-7777-4777-8777-777777777777',
              'PLATFORM10',
              VoucherScope.platform,
              DiscountType.percentage,
              10,
            ),
            voucher(
              '88888888-8888-4888-8888-888888888888',
              'VENDOR30',
              VoucherScope.vendor,
              DiscountType.fixed_amount,
              30,
            ),
          ]),
      },
      voucherDetail: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = new VouchersService({} as PrismaService);
    const result = await service.calculate(
      ['PLATFORM10', 'VENDOR30'],
      '99999999-9999-4999-8999-999999999999',
      [
        {
          productVariantId: '55555555-5555-4555-8555-555555555555',
          quantity: 1,
        },
        {
          productVariantId: '66666666-6666-4666-8666-666666666666',
          quantity: 1,
        },
      ],
      db as never,
    );

    expect(result.applications.map((item) => item.scope)).toEqual([
      VoucherScope.vendor,
      VoucherScope.platform,
    ]);
    expect(result.applications[0].discountAmount.toString()).toBe('20');
    expect(result.applications[1].discountAmount.toString()).toBe('8');
    expect(result.totalAmount.toString()).toBe('72');
  });

  it('rejects two vouchers of the same scope', async () => {
    const db = {
      productVariant: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            variant('55555555-5555-4555-8555-555555555555', 20, productId),
          ]),
      },
      voucher: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            voucher(
              '77777777-7777-4777-8777-777777777777',
              'ONE',
              VoucherScope.platform,
              DiscountType.percentage,
              10,
            ),
            voucher(
              '88888888-8888-4888-8888-888888888888',
              'TWO',
              VoucherScope.platform,
              DiscountType.percentage,
              20,
            ),
          ]),
      },
      voucherDetail: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = new VouchersService({} as PrismaService);

    await expect(
      service.calculate(
        ['ONE', 'TWO'],
        '99999999-9999-4999-8999-999999999999',
        [
          {
            productVariantId: '55555555-5555-4555-8555-555555555555',
            quantity: 1,
          },
        ],
        db as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
