import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_SKIP_AUTH } from './auth.decorator';
import { AuthService, TokenPayload } from './auth.service';
import { TokenKeys } from './consts/jwt.const';

type AuthenticatedRequest = Request & {
  user?: TokenPayload;
  cookies?: Record<string, string>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Không tìm thấy access token');
    }

    const payload = await this.authService.verifyToken(token);

    request.user = {
      userID: payload.userID,
      userEmail: payload.userEmail,
      fullName: payload.fullName,
      phone: payload.phone,
      avatar: payload.avatar,
      gender: payload.gender,
      address: payload.address,
      role: payload.role,
    };

    return true;
  }

  private extractTokenFromRequest(
    request: AuthenticatedRequest,
  ): string | undefined {
    const [type, bearerToken] = request.headers.authorization?.split(' ') ?? [];

    if (type === 'Bearer' && bearerToken) {
      return bearerToken;
    }

    return request.cookies?.[TokenKeys.ACCESS_TOKEN_KEY];
  }
}
