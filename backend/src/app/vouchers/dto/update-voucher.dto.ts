import { DiscountType } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

import { VoucherFieldsSchema } from './create-voucher.dto';

export class UpdateVoucherDto extends createZodDto(
  VoucherFieldsSchema.partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Cần gửi ít nhất một trường để cập nhật',
    })
    .superRefine((data, context) => {
      if (
        data.startDate &&
        data.endDate &&
        new Date(data.endDate) <= new Date(data.startDate)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'Ngày kết thúc phải sau ngày bắt đầu',
        });
      }
      if (
        data.discountType === DiscountType.percentage &&
        data.discountValue !== undefined &&
        data.discountValue > 100
      ) {
        context.addIssue({
          code: 'custom',
          path: ['discountValue'],
          message: 'Phần trăm giảm không được vượt quá 100',
        });
      }
    }),
) {}
