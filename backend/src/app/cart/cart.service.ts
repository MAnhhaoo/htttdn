import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      productVariant: {
        include: {
          productColor: {
            include: {
              product: {
                include: { category: true },
              },
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: { deletedAt: null },
      include: cartInclude,
    });
    return this.format(cart);
  }

  async add(userId: string, dto: AddCartItemDto) {
    const variant = await this.getSellableVariant(dto.productVariantId);
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: { deletedAt: null },
      select: { id: true },
    });
    const current = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
        },
      },
    });
    const quantity = (current?.quantity ?? 0) + dto.quantity;
    if (quantity > variant.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }
    await this.prisma.cartItem.upsert({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId: dto.productVariantId,
        },
      },
      create: { cartId: cart.id, ...dto },
      update: { quantity },
    });
    return this.get(userId);
  }

  async update(userId: string, itemId: string, quantity: number) {
    const item = await this.getOwnedItem(userId, itemId);
    const variant = await this.getSellableVariant(item.productVariantId);
    if (quantity > variant.stock) {
      throw new BadRequestException('Số lượng vượt quá tồn kho');
    }
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.get(userId);
  }

  async remove(userId: string, itemId: string) {
    await this.getOwnedItem(userId, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.get(userId);
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart)
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.get(userId);
  }

  private getSellableVariant(id: string) {
    return this.prisma.productVariant
      .findFirst({
        where: {
          id,
          deletedAt: null,
          productColor: {
            deletedAt: null,
            product: { deletedAt: null, status: ProductStatus.active },
          },
        },
      })
      .then((variant) => {
        if (!variant)
          throw new NotFoundException('Biến thể sản phẩm không tồn tại');
        return variant;
      });
  }

  private getOwnedItem(userId: string, itemId: string) {
    return this.prisma.cartItem
      .findFirst({ where: { id: itemId, cart: { userId, deletedAt: null } } })
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
      subtotalAmount: subtotal.toFixed(2),
    };
  }
}
