import { createZodDto } from 'nestjs-zod';
import { CreateProductObjectSchema } from './create-product.dto';

export class UpdateProductDto extends createZodDto(
  CreateProductObjectSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      message: 'Cần gửi ít nhất một trường để cập nhật',
    },
  ),
) {}

