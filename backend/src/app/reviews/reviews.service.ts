import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, ProductStatus } from '@prisma/client';

import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsPaginationDto } from './dto/get-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll(query: GetReviewsPaginationDto) {
    const { page, itemPerPage, skip } = normalizePagination(query);
    const where = { deletedAt: null };
    const totalItems = await this.prisma.extended.review.count({ where });
    const list = await this.prisma.extended.review.findMany({
      where,
      skip,
      take: itemPerPage,
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return formatPaginatedList(list, totalItems, { page, itemPerPage });
  }

  listByProduct(productId: string) {
    return this.prisma.extended.review.findMany({
      where: {
        productId,
        deletedAt: null,
        product: { deletedAt: null, status: ProductStatus.active },
      },
      include: {
        client: { select: { id: true, fullName: true, avatarUrl: true } },
        orderDetail: {
          select: {
            productVariant: {
              select: {
                size: true,
                productColor: { select: { color: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(clientId: string, dto: CreateReviewDto) {
    const detail = await this.prisma.extended.orderDetail.findFirst({
      where: {
        id: dto.orderDetailId,
        order: { clientId, status: OrderStatus.completed },
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
    return this.prisma.extended.review.create({
      data: {
        clientId,
        orderDetailId: detail.id,
        productId: detail.productVariant.productColor.productId,
        rating: dto.rating,
        content: dto.content,
      },
      include: { client: { select: { id: true, fullName: true } } },
    });
  }

  async update(clientId: string, id: string, dto: UpdateReviewDto) {
    await this.getOwned(clientId, id);
    return this.prisma.extended.review.update({ where: { id }, data: dto });
  }

  async remove(clientId: string, id: string) {
    await this.getOwned(clientId, id);
    return this.prisma.extended.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async moderateRemove(id: string) {
    const review = await this.prisma.extended.review.findFirst({
      where: { id, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    return this.prisma.extended.review.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async getOwned(clientId: string, id: string) {
    const review = await this.prisma.extended.review.findFirst({
      where: { id, clientId, deletedAt: null },
    });
    if (!review) throw new NotFoundException('Đánh giá không tồn tại');
    return review;
  }
}
