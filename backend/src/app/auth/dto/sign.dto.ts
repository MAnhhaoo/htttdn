import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { withResponse } from '../../../common/interceptors/format-response/format-response.util';
import { TokenKeys } from '../consts/jwt.const';

const EmailSchema = z
  .string({ error: 'Email là bắt buộc và phải là chuỗi' })
  .trim()
  .min(1, 'Email không được để trống')
  .email('Email không đúng định dạng')
  .max(255, 'Email không được vượt quá 255 ký tự')
  .transform((email) => email.toLowerCase());

const PasswordSchema = z
  .string({ error: 'Mật khẩu là bắt buộc và phải là chuỗi' })
  .min(1, 'Mật khẩu không được để trống')
  .max(72, 'Mật khẩu không được vượt quá 72 ký tự');

// DTO của API cần quy tắc riêng, không nên dùng trực tiếp schema được sinh từ
// Prisma vì schema database không kiểm tra định dạng email/mật khẩu.
const SignInSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
  })
  .strict();

const SignUpSchema = z
  .object({
    fullName: z
      .string({ error: 'Họ tên là bắt buộc và phải là chuỗi' })
      .trim()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(255, 'Họ tên không được vượt quá 255 ký tự'),
    email: EmailSchema,
    password: PasswordSchema.min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    phone: z
      .string({ error: 'Số điện thoại phải là chuỗi' })
      .trim()
      .min(9, 'Số điện thoại phải có ít nhất 9 ký tự')
      .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
      .nullable()
      .optional(),
    address: z
      .string({ error: 'Địa chỉ phải là chuỗi' })
      .trim()
      .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
      .nullable()
      .optional(),
  })
  .strict();

// HOC / HOF: nhận schema dữ liệu và bọc bằng cấu trúc response chung.
const SignInResponseSchema = withResponse(
  z.object({
    [TokenKeys.ACCESS_TOKEN_KEY]: z.string().min(1),
    [TokenKeys.REFRESH_TOKEN_KEY]: z.string().min(1),
  }),
);

class SignInDto extends createZodDto(SignInSchema) {}

class SignInResponseDto extends createZodDto(SignInResponseSchema) {}

class SignUpDto extends createZodDto(SignUpSchema) {}

export { SignInDto, SignInResponseDto, SignUpDto };
