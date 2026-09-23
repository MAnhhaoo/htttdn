import { createZodDto } from 'nestjs-zod';
import { ProductVariantFieldsSchema } from './createProductVariant.dto';

export class UpdateProductVariantDto extends createZodDto(
  ProductVariantFieldsSchema.partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Cần gửi ít nhất một trường để cập nhật',
    }),
) {}
