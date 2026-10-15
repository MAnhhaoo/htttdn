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

export class RecordAttendanceDto extends createZodDto(
  z.object({
    employeeId: z.string().uuid(),
    date: z.string(), // ISO date 'YYYY-MM-DD'
    checkIn: z.string().optional().nullable(),
    checkOut: z.string().optional().nullable(),
    hoursWorked: z.coerce.number().min(0).max(24).optional().nullable(),
    status: z.enum(['present', 'absent', 'late', 'leave']).default('present'),
    note: z.string().max(500).optional().nullable(),
  }),
) {}
