import { createZodDto } from 'nestjs-zod';
import { CreateProductSchema } from './create-product.dto';

export class UpdateProductDto extends createZodDto(
  CreateProductSchema.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Cần gửi ít nhất một trường để cập nhật',
  }),
) {}
