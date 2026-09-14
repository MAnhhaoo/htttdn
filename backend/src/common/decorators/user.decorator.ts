import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User as UserEntity } from '../../app/users/entities/user.entity';

export interface UserInfo {
  userID: UserEntity['id'];
  userEmail: UserEntity['email'];
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
