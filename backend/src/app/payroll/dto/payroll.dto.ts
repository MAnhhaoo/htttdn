import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CalculatePayrollDto extends createZodDto(
  z.object({
    month: z.coerce.number().int().min(1).max(12),
    year: z.coerce.number().int().min(2020).max(2035),
    department: z.string().optional(),
  }),
) {}

export class UpdatePayrollItemDto extends createZodDto(
  z.object({
    allowances: z.coerce.number().min(0).optional(),
    deductions: z.coerce.number().min(0).optional(),
    bonus: z.coerce.number().min(0).optional(),
    status: z.enum(['draft', 'approved', 'paid']).optional(),
    notes: z.string().max(1000).optional(),
  }),
) {}

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));
const dateString = (label: string) =>
  z.string().refine(isValidDate, { message: `${label} không phải ngày giờ hợp lệ` });
const timeOfDay = z
  .string()
  .regex(/^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, 'Giờ phải có dạng HH:mm');

export class RecordAttendanceDto extends createZodDto(
  z.object({
    // Nhân viên tự chấm công: employeeId luôn lấy từ token, không cần gửi lên
    employeeId: z.string().uuid().optional(),
    date: dateString('date'), // ISO date 'YYYY-MM-DD'
    checkIn: dateString('checkIn').optional().nullable(),
    checkOut: dateString('checkOut').optional().nullable(),
    hoursWorked: z.coerce.number().min(0).max(24).optional().nullable(),
    status: z.enum(['present', 'absent', 'late', 'leave']).default('present'),
    note: z.string().max(500).optional().nullable(),
    shiftStart: timeOfDay.optional().nullable(),
    shiftEnd: timeOfDay.optional().nullable(),
    lateReason: z.string().optional().nullable(),
  }),
) {}
