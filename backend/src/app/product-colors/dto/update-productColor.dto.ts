import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Body là multipart/form-data: ảnh lấy từ file upload, trường còn lại là chuỗi.
const UpdateProductColorSchema = z.object({
  color: z.string().trim().min(1, 'Tên màu không được để trống').max(100).optional(),
  imageUrls: z.array(z.string()).optional(),
});

export class UpdateProductColorDto extends createZodDto(UpdateProductColorSchema) {}
