import { DiscountType, VoucherStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VoucherFieldsSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().min(1).max(255),
    discountType: z.enum(DiscountType),
    discountValue: z.number().finite().positive().max(9_999_999_999.99),
    minOrderAmount: z.number().finite().nonnegative().optional(),
    maxDiscountAmount: z.number().finite().positive().optional(),
    quantity: z.number().int().positive(),
    perUserLimit: z.number().int().positive().default(1),
    startDate: z.iso.datetime({ offset: true }),
    endDate: z.iso.datetime({ offset: true }),
    status: z.enum(VoucherStatus).default(VoucherStatus.draft),
    productIds: z.array(z.uuid()).min(1).max(100).optional(),
  })
  .strict();

const validateVoucher = (
  data: z.infer<typeof VoucherFieldsSchema>,
  context: z.RefinementCtx,
) => {
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    context.addIssue({
      code: 'custom',
      path: ['endDate'],
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
    });
  }
  if (
    data.discountType === DiscountType.percentage &&
    data.discountValue > 100
  ) {
    context.addIssue({
      code: 'custom',
      path: ['discountValue'],
      message: 'Phần trăm giảm không được vượt quá 100',
    });
  }
  if (data.perUserLimit > data.quantity) {
    context.addIssue({
      code: 'custom',
      path: ['perUserLimit'],
      message: 'Giới hạn mỗi người không được vượt quá số lượng voucher',
    });
  }
};

export const CreateVoucherSchema =
  VoucherFieldsSchema.superRefine(validateVoucher);

export class CreateVoucherDto extends createZodDto(CreateVoucherSchema) {}
