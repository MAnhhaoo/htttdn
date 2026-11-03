import { ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';
import { PrismaService } from '../prisma/prisma.service';

// lấy kiểu dữ liệu của thuộc tính extanded nằm trong PrismaService
type ExtendedClient = PrismaService['extended'];
export class PrismaBaseService<
  K extends keyof PrismaClient & keyof ExtendedClient,
> {
  constructor(
    protected prismaService: PrismaService,
    private readonly model: K,
  ) {}

  protected get extended(): ExtendedClient[K] {
    return this.prismaService.extended[this.model];
  }

  /**
   * Kiểm tra bản ghi trùng khóa unique:
   * - Nếu đang tồn tại (deletedAt === null) -> ném ConflictException(conflictMessage).
   * - Nếu đã xóa mềm (deletedAt !== null) -> khôi phục lại bản ghi với restoreData + deletedAt: null.
   * - Nếu chưa tồn tại -> trả về null để tầng gọi tiếp tục tạo mới.
   */
  protected async restoreOrThrowIfActive<
    TRecord extends { id: string; deletedAt?: Date | null },
    TResult = TRecord,
  >(params: {
    existing: TRecord | null | undefined;
    conflictMessage: string;
    restoreData?: Record<string, unknown>;
  }): Promise<TResult | null> {
    const { existing, conflictMessage, restoreData = {} } = params;
    if (!existing) {
      return null;
    }
    if (!existing.deletedAt) {
      throw new ConflictException(conflictMessage);
    }
    const delegate = this.extended as unknown as {
      update: (args: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => Promise<TResult>;
    };
    return delegate.update({
      where: { id: existing.id },
      data: { ...restoreData, deletedAt: null },
    });
  }
}
