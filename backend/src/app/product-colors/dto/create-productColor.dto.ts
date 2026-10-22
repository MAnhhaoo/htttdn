import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Body là multipart/form-data: ảnh lấy từ file upload, các trường còn lại là chuỗi.
const CreateProductColorSchema = z.object({
  productId: z.guid({ message: 'productId không hợp lệ' }),
  color: z.string().trim().min(1, 'Tên màu không được để trống').max(100),
  imageUrls: z.array(z.string()).optional(),
});

export class CreateProductColorDto extends createZodDto(CreateProductColorSchema) {}
