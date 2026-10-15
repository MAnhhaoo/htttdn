import { createParamDecorator, ExecutionContext } from '@nestjs/common';




/**
 * Thông tin người dùng được giải mã từ JWT token và gắn vào request.
 * Đồng bộ với `TokenPayload` trong `auth.service.ts` để đảm bảo
 * tất cả trường từ token đều có thể truy cập trong controller qua @User().
 */
export interface UserInfo {
  userID: string;
  userEmail: string;
  fullName: string;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  address: string | null;
  role: 'admin' | 'client' | 'vendor' | 'employee';
}

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserInfo => {
    const req = ctx.switchToHttp().getRequest<{
      user: UserInfo;
    }>();

    return req.user;
  },
);
