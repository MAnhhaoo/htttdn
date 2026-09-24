import { Logger } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users/users.service';
import { RealtimeService } from './realtime.service';

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
        !allowedOrigins.length ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin không được phép'));
    },
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.bind(server);
  }

  async handleConnection(client: Socket) {
    try {
      const authorization = client.handshake.headers.authorization;
      const raw = client.handshake.auth?.token || authorization;
      const token =
        typeof raw === 'string' ? raw.replace(/^Bearer\s+/i, '') : '';
      const payload = await this.authService.verifyToken(token);
      const user = await this.usersService.getUserRole(payload.userID);
      if (!user || user.status !== UserStatus.active || user.deletedAt) {
        throw new Error('Inactive user');
      }

      client.data.user = payload;
      await client.join(`user:${user.id}`);
      if (user.role === UserRole.vendor) await client.join(`vendor:${user.id}`);
      if (user.role === UserRole.admin) await client.join('admins');
      client.emit('realtime:ready', { userId: user.id, role: user.role });
    } catch {
      this.logger.warn(`Rejected socket ${client.id}`);
      client.disconnect(true);
    }
  }
}
