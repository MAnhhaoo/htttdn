import { Prisma } from '@prisma/client';

class ExportProductsColorDto {
  ids: NonNullable<Prisma.ProductColorWhereUniqueInput['id']>;
}

export { ExportProductsColorDto };
