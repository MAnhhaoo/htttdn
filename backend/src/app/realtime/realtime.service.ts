import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server?: Server;

  bind(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }

  emitToVendor(vendorId: string, event: string, payload: unknown) {
    this.server?.to(`vendor:${vendorId}`).emit(event, payload);
  }

  emitToAdmins(event: string, payload: unknown) {
    this.server?.to('admins').emit(event, payload);
  }
}
