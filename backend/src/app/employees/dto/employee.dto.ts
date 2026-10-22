import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateEmployeeDto extends createZodDto(
  z.object({
    fullName: z.string().min(2, 'Họ tên phải từ 2 ký tự').max(255),
    email: z.string().email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
    phone: z.string().max(50).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    citizenId: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    department: z.string().min(1, 'Phòng ban không được để trống').max(100),
    position: z.string().min(1, 'Vị trí/chức vụ không được để trống').max(100),
    employmentType: z.enum(['full_time', 'part_time']).default('full_time'),
    salary: z.coerce.number().min(0).default(0),
    hourlyRate: z.coerce.number().min(0).optional().nullable(),
    hireDate: z.string().optional().nullable(),
    assignedOrderScope: z.string().default('assigned_orders'),
    permissions: z.record(z.string(), z.any()).optional().nullable(),
  }),
) {}

export class UpdateEmployeeDto extends createZodDto(
  z.object({
    fullName: z.string().min(2).max(255).optional(),
    password: z.string().min(6).optional(),
    phone: z.string().max(50).optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    citizenId: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    department: z.string().max(100).optional(),
    position: z.string().max(100).optional(),
    employmentType: z.enum(['full_time', 'part_time']).optional(),
    salary: z.coerce.number().min(0).optional(),
    hourlyRate: z.coerce.number().min(0).optional().nullable(),
    hireDate: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
    assignedOrderScope: z.string().optional(),
    permissions: z.record(z.string(), z.any()).optional().nullable(),
    salaryAdjustmentReason: z.string().max(500).optional(),
  }),
) {}

export class GetEmployeesPaginationDto extends createZodDto(
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    itemPerPage: z.coerce.number().int().min(1).max(100).default(10),
    q: z.string().optional(),
    department: z.string().optional(),
    employmentType: z.enum(['full_time', 'part_time']).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
) {}

export class SendEmployeeNotificationDto extends createZodDto(
  z.object({
    // Bỏ trống hoặc 'all' = gửi cho tất cả nhân viên đang hoạt động
    employeeId: z.union([z.literal('all'), z.guid()]).optional().nullable(),
    type: z.enum(['info', 'warning', 'alert', 'urgent']).optional(),
    title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(255),
    content: z.string().trim().min(1, 'Nội dung không được để trống').max(2000),
  }),
) {}
