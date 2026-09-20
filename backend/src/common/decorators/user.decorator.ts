import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User as UserEntity } from '../../app/users/entities/user.entity';

/**
 * Thông tin người dùng được giải mã từ JWT token và gắn vào request.
 * Đồng bộ với `TokenPayload` trong `auth.service.ts` để đảm bảo
 * tất cả trường từ token đều có thể truy cập trong controller qua @User().
 */
export interface UserInfo {
  userID: UserEntity['id'];
  userEmail: UserEntity['email'];
  fullName: string;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  address: string | null;
  role: UserRole;
}

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserInfo => {
    const req = ctx.switchToHttp().getRequest<{
      user: UserInfo;
    }>();

    return req.user;
  },
);
