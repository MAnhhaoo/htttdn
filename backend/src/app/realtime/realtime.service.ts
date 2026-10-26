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

  emitToEmployees(event: string, payload: unknown) {
    this.server?.to('employees').emit(event, payload);
  }

  emitToCatalog(event: string, payload: unknown) {
    this.server?.to('catalog').emit(event, payload);
  }

  emitProductUpdated(productId: string, vendorId: string | null) {
    const payload = { productId, vendorId };
    this.emitToAdmins('product:updated', payload);
    if (vendorId) this.emitToVendor(vendorId, 'product:updated', payload);
    this.emitToCatalog('product:updated', payload);
  }

  emitCategoryUpdated(categoryId?: string) {
    this.server?.to(['catalog', 'admins', 'vendors']).emit('category:updated', { categoryId });
  }

  disconnectUser(userId: string) {
    this.server?.in(`user:${userId}`).disconnectSockets(true);
  }
}
