import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const AddressSchema = z.object({
  receiverName: z.string().trim().min(1).max(255),
  phone: z.string().trim().min(1).max(50),
  addressLine: z.string().trim().min(1).max(500),
  ward: z.string().trim().max(255).nullable().optional(),
  district: z.string().trim().max(255).nullable().optional(),
  province: z.string().trim().max(255).nullable().optional(),
  label: z.string().trim().max(100).nullable().optional(),
  isDefault: z.boolean().optional(),
});

export class CreateAddressDto extends createZodDto(AddressSchema.strict()) {}

export class UpdateAddressDto extends createZodDto(
  AddressSchema.partial().strict(),
) {}
