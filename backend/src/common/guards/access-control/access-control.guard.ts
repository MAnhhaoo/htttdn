import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_SKIP_AUTH } from '../../../app/auth/auth.decorator';
import { TokenPayload } from '../../../app/auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';

import { Actions, ROLE_ACTION } from './access-control.const';
import { ROLES_KEY } from './roles.decorator';
import { RequestMethod } from '../../utils/api-util/api-util.const';
import { UserRole } from './roles.decorator';
import { assertVendorApproved } from '../../utils/vendor-approval/vendor-approval.util';

/**
 * Dùng TokenPayload (đầy đủ trường từ JWT) thay vì type cục bộ
 * để đảm bảo kiểu dữ liệu `request.user` đồng bộ với AuthGuard.
 */
type AuthenticatedUser = TokenPayload;

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  private async resolveUser(userID: string): Promise<{ user: any; role: UserRole }> {
    const select = { status: true, deletedAt: true };
    let user: any = await this.prismaService.admin.findUnique({ where: { id: userID }, select });
    let role: UserRole = 'admin';
    if (!user) { user = await this.prismaService.client.findUnique({ where: { id: userID }, select }); role = 'client'; }
    if (!user) { user = await this.prismaService.vendor.findUnique({ where: { id: userID }, select: { ...select, approvalStatus: true } }); role = 'vendor'; }
    if (!user) { user = await this.prismaService.employee.findUnique({ where: { id: userID }, select }); role = 'employee'; }
    return { user, role };
  }

  private async canAccessResources(
    userID: string,
    action: Actions,
  ): Promise<boolean> {
    const { user, role } = await this.resolveUser(userID);

    if (!user || user.status !== 'active' || user.deletedAt) {
      return false;
    }

    if (role === 'vendor') assertVendorApproved(user.approvalStatus);

    const allowedActions = ROLE_ACTION[role] ?? [];

    return (
      allowedActions.includes(Actions.MANAGE) || allowedActions.includes(action)
    );
  }

  private getAction(httpMethod: RequestMethod): Actions {
    const actionsConverter: Partial<Record<RequestMethod, Actions>> = {
      [RequestMethod.GET]: Actions.READ,
      [RequestMethod.POST]: Actions.CREATE,
      [RequestMethod.PUT]: Actions.UPDATE,
      [RequestMethod.PATCH]: Actions.UPDATE,
      [RequestMethod.DELETE]: Actions.DELETE,
    };

    const action = actionsConverter[httpMethod];

    if (!action) {
      throw new BadRequestException(
        `Action for HTTP method "${httpMethod}" is not defined`,
      );
    }

    return action;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isSkipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & {
        user?: AuthenticatedUser;
      }
    >();

    const authenticatedUser = request.user;

    if (!authenticatedUser?.userID) {
      throw new UnauthorizedException('Bạn chưa đăng nhập');
    }

    /*
     * Nếu API có @Roles() thì kiểm tra role cụ thể.
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length) {
      const { user: currentUser, role } = await this.resolveUser(authenticatedUser.userID);
      if (
        !currentUser ||
        currentUser.status !== 'active' ||
        currentUser.deletedAt
      ) {
        throw new UnauthorizedException('Tài khoản không còn hoạt động');
      }
      authenticatedUser.role = role;
      if (
        !authenticatedUser.role ||
        !requiredRoles.includes(authenticatedUser.role)
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền thực hiện chức năng này',
        );
      }
      if (role === 'vendor') assertVendorApproved(currentUser.approvalStatus);

      return true;
    }

    /*
     * Nếu API không có @Roles() thì kiểm tra ROLE_ACTION.
     */
    const action = this.getAction(request.method as RequestMethod);

    const canAccess = await this.canAccessResources(
      authenticatedUser.userID,
      action,
    );

    if (!canAccess) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    return true;
  }
}
