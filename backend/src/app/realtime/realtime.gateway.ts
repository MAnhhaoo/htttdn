import { Logger, Optional } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthService } from 'src/app/auth/auth.service';
import { AccountDirectoryService } from 'src/common/account/account-directory.service';
import type { UserRole } from 'src/common/guards/access-control/access-control.const';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from './realtime.service';
import { TokenKeys } from '../auth/consts/jwt.const';

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins = (process.env.FE_URL ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (
        !origin ||
        (process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(origin)) ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin không được phép'));
    },
    credentials: true}})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  private readonly fallbackDirectory: AccountDirectoryService;

  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
    private readonly realtimeService: RealtimeService,
    @Optional() private readonly accountDirectory?: AccountDirectoryService,
  ) {
    this.fallbackDirectory = new AccountDirectoryService(this.prismaService);
  }

  private get directory(): AccountDirectoryService {
    return this.accountDirectory ?? this.fallbackDirectory;
  }

  afterInit(server: Server) {
    this.realtimeService.bind(server);
  }

  async handleConnection(client: Socket) {
    try {
      const authorization = client.handshake.headers.authorization;
      const role = client.handshake.auth?.role;
      if (role === 'guest') {
        await client.join('catalog');
        client.emit('realtime:ready', { role: 'guest' });
        return;
      }
      const cookies = Object.fromEntries(
        (client.handshake.headers.cookie ?? '').split(';').map((part) => {
          const index = part.indexOf('=');
          return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
        }),
      );
      const cookieToken =
        typeof role === 'string' && ['client', 'vendor', 'admin', 'employee'].includes(role)
          ? cookies[`${TokenKeys.ACCESS_TOKEN_KEY}_${role}`]
          : undefined;
      const raw = client.handshake.auth?.token || authorization || cookieToken;
      const token =
        typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '') : '';
      const payload = await this.authService.verifyToken(token);
      if (role && role !== payload.role) throw new Error('Role mismatch');
      const roleHint = (role || payload.role) as UserRole | undefined;
      const leanSelect = { id: true, status: true, deletedAt: true } as const;
      let user: any = null;
      if (
        roleHint &&
        ['admin', 'client', 'vendor', 'employee'].includes(roleHint)
      ) {
        user = await (this.prismaService.extended as any)[roleHint].findUnique({
          where: { id: payload.userID },
          select: leanSelect,
        });
      } else {
        user = (
          await this.directory.resolveAccountForGuard(payload.userID, roleHint)
        ).user;
      }
      if (!user || user.status !== UserStatus.active || user.deletedAt) {
        throw new Error('Inactive user');
      }

      client.data.user = payload;
      await client.join(`user:${user.id}`);
      if (payload.role === 'client') await client.join('catalog');
      if (payload.role === 'vendor') {
        await client.join(`vendor:${user.id}`);
        await client.join('vendors');
      }
      if (payload.role === 'admin') await client.join('admins');
      if (payload.role === 'employee') await client.join('employees');
      client.emit('realtime:ready', { userId: user.id, role: payload.role });
    } catch {
      this.logger.warn(`Rejected socket ${client.id}`);
      client.disconnect(true);
    }
  }
}
