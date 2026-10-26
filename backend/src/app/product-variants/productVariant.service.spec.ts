import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { ProductVariantService } from './productVariant.service';

describe('ProductVariantService', () => {
  const vendorId = '11111111-1111-4111-8111-111111111111';
  const productColorId = '44444444-4444-4444-8444-444444444444';

  function setup() {
    const variantDelegate = {
      update: jest.fn().mockImplementation(({ data }) => ({ id: 'old', ...data })),
      create: jest.fn().mockImplementation(({ data }) => ({ id: 'new', ...data })),
      findFirst: jest.fn().mockResolvedValue(null),
    };
    const prisma = {
      extended: {
        productColor: { findFirst: jest.fn().mockResolvedValue({ id: productColorId }) },
        productVariant: variantDelegate,
      },
      productVariant: { findUnique: jest.fn().mockResolvedValue(null), findFirst: jest.fn().mockResolvedValue(null) },
      productColor: { findUnique: jest.fn().mockResolvedValue({ productId: 'product' }) },
    };
    const realtime = { emitProductUpdated: jest.fn() };
    const service = new ProductVariantService(
      prisma as unknown as PrismaService,
      realtime as unknown as RealtimeService,
    );
    return { service, prisma, variantDelegate };
  }

  it('restores a soft-deleted size instead of failing on the unique constraint', async () => {
    const { service, prisma, variantDelegate } = setup();
    prisma.productVariant.findUnique.mockResolvedValue({ id: 'old', deletedAt: new Date() });

    const result = await service.createProductVariant(
      { productColorId, size: 'S', price: 100, stock: 3 },
      vendorId,
    );

    expect(variantDelegate.create).not.toHaveBeenCalled();
    expect(variantDelegate.update).toHaveBeenCalledWith({
      where: { id: 'old' },
      data: { deletedAt: null, price: 100, stock: 3 },
    });
    expect(result).toMatchObject({ deletedAt: null, price: 100, stock: 3 });
  });

  it('rejects a size that already exists and is active', async () => {
    const { service, prisma } = setup();
    prisma.productVariant.findUnique.mockResolvedValue({ id: 'live', deletedAt: null });

    await expect(
      service.createProductVariant({ productColorId, size: 'S', price: 100, stock: 3 }, vendorId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates a new variant when the size was never used', async () => {
    const { service, variantDelegate } = setup();

    await service.createProductVariant({ productColorId, size: 'XL', price: 50, stock: 1 }, vendorId);

    expect(variantDelegate.create).toHaveBeenCalledTimes(1);
  });
});
