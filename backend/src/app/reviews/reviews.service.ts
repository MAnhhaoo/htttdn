import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  listByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: {
        productId,
        deletedAt: null,
        product: { deletedAt: null, status: ProductStatus.active },
      },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateReviewDto) {
    const detail = await this.prisma.orderDetail.findFirst({
      where: {
        id: dto.orderDetailId,
        order: { userId, status: OrderStatus.completed },
      },
      include: {
        review: true,
        productVariant: { include: { productColor: true } },
      },
    });
    if (!detail)
      throw new ForbiddenException(
        'Chỉ được đánh giá sản phẩm trong đơn đã hoàn thành',
      );
    if (detail.review)
      throw new ConflictException('Sản phẩm trong đơn này đã được đánh giá');
    return this.prisma.review.create({
      data: {
        userId,
        orderDetailId: detail.id,
        productId: detail.productVariant.productColor.productId,
        rating: dto.rating,
        content: dto.content,
      },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    await this.getOwned(userId, id);
    return this.prisma.review.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.getOwned(userId, id);
    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async moderateRemove(id: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    return this.prisma.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async getOwned(userId: string, id: string) {
    const review = await this.prisma.review.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    return review;
  }
}
