// import { Request } from 'express';
// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { IS_SKIP_AUTH } from './auth.decorator';
// import { Reflector } from '@nestjs/core';
// import { AuthService } from './auth.service';
// import { UserInfo } from '../../common/decorators/user.decorator';
// import { TokenKeys } from './consts/jwt.const';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   constructor(
//     private reflector: Reflector,
//     private authService: AuthService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isSkipAuth) {
//       return true;
//     }

//     const req = context.switchToHttp().getRequest<Request>();
//     const token = this.extractTokenFromHeader(req);
//     if (!token) throw new UnauthorizedException();

//     try {
//       const payload = await this.authService.verifyToken(token);
//       const { iat, exp, ...user } = payload;
//       req['user'] = user as UserInfo;
//     } catch (err) {
//       throw new UnauthorizedException(err.message);
//     }
//     return true;
//   }

//   private extractTokenFromHeader(req: Request): string | undefined {
//     const [type, bearerToken] = req.headers.authorization?.split(' ') ?? [];
//     if (type === 'Bearer') return bearerToken;
//     const cookieToken = req.cookies[TokenKeys.ACCESS_TOKEN_KEY];
//     return cookieToken ? cookieToken : undefined;
//   }
// }
