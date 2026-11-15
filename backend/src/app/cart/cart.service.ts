import {
  BadRequestException,
  Injectable,
  NotFoundException} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { PRODUCT_VARIANT_SUMMARY_SELECT } from 'src/common/prisma/prisma-selects.const';
import { AddCartItemDto } from './dto/add-cart-item.dto';

const cartInclude = {
  items: {
    where: {
      deletedAt: null,
      productVariant: {
        deletedAt: null,
        productColor: {
          is: {
            deletedAt: null,
            product: {
              is: {
                deletedAt: null,
                status: ProductStatus.active,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
    include: {
      productVariant: {
        select: PRODUCT_VARIANT_SUMMARY_SELECT,
      },
    },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async get(clientId: string) {
    const cart = await this.prisma.extended.cart.upsert({
      where: { clientId },
      create: { clientId },
      update: { deletedAt: null },
      include: cartInclude});
    return this.format(cart);
  }

  async add(clientId: string, dto: AddCartItemDto) {
    const variant = await this.getSellableVariant(dto.productVariantId);
    const cart = await this.prisma.extended.cart.upsert({
      where: { clientId },
      create: { clientId },
      update: { deletedAt: null },
      select: { id: true }});
    const current = await this.prisma.extended.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: dto.productVariantId}}});

    if (current && current.deletedAt === null) {
      const nextQty = current.quantity + dto.quantity;
      if (nextQty > variant.stock) {
        throw new BadRequestException('Số lượng vượt quá tồn kho');
      }
      await this.prisma.extended.cartItem.update({
        where: { id: current.id },
        data: { quantity: nextQty },
      });
    } else if (current && current.deletedAt !== null) {
      const nextQty = dto.quantity;
      if (nextQty > variant.stock) {
        throw new BadRequestException('Số lượng vượt quá tồn kho');
      }
      await this.prisma.extended.cartItem.update({
        where: { id: current.id },
        data: { quantity: nextQty, deletedAt: null },
      });
    } else {
      if (dto.quantity > variant.stock) {
        throw new BadRequestException('Số lượng vượt quá tồn kho');
      }
      await this.prisma.extended.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
          quantity: dto.quantity,
        },
      });
    }
    return this.get(clientId);
  }

  async update(clientId: string, itemId: string, quantity: number) {
    const item = await this.getOwnedItem(clientId, itemId);
    const variant = await this.getSellableVariant(item.productVariantId);
    if (quantity > variant.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }
    await this.prisma.extended.cartItem.update({
      where: { id: item.id },
      data: { quantity }});
    return this.get(clientId);
  }

  async remove(clientId: string, itemId: string) {
    const item = await this.getOwnedItem(clientId, itemId);
    await this.prisma.extended.cartItem.update({
      where: { id: item.id },
      data: { deletedAt: new Date() },
    });
    return this.get(clientId);
  }

  async clear(clientId: string) {
    const cart = await this.prisma.extended.cart.findUnique({ where: { clientId } });
    if (cart && !cart.deletedAt) {
      await this.prisma.extended.cartItem.updateMany({
        where: { cartId: cart.id, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }
    return this.get(clientId);
  }

  private getSellableVariant(id: string) {
    return this.prisma.extended.productVariant
      .findFirst({
        where: {
          id,
          deletedAt: null,
          productColor: {
            deletedAt: null,
            product: { deletedAt: null, status: ProductStatus.active }}}})
      .then((variant) => {
        if (!variant)
          throw new NotFoundException('Biến thể sản phẩm không tồn tại');
        return variant;
      });
  }

  private getOwnedItem(clientId: string, itemId: string) {
    return this.prisma.extended.cartItem
      .findFirst({
        where: {
          id: itemId,
          deletedAt: null,
          cart: { clientId, deletedAt: null },
        },
      })
      .then((item) => {
        if (!item)
          throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
        return item;
      });
  }

  private format<
    T extends {
      items: Array<{
        quantity: number;
        productVariant: {
          price: { mul(value: number): { toString(): string } };
        };
      }>;
    },
  >(cart: T) {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.productVariant.price) * item.quantity,
      0,
    );
    return {
      ...cart,
      totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalAmount: subtotal.toFixed(2)};
  }
}
