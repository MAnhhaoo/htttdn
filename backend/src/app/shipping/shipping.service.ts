import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma, ShipmentStatus } from '@prisma/client';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { OrdersService } from '../orders/orders.service';
import {
  AssignCarrierDto,
  GetShipmentsQueryDto,
  UpdateShipmentStatusDto,
} from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(private readonly prisma: PrismaService, private readonly realtime: RealtimeService, private readonly orders: OrdersService) {}

  async listShipments(query: GetShipmentsQueryDto, user?: UserInfo) {
    const { page = 1, itemPerPage = 10, q, status, carrierId } = query;
    const skip = (page - 1) * itemPerPage;

    const where: Prisma.ShipmentWhereInput = {
      ...(status ? { status: status as ShipmentStatus } : {}),
      ...(user?.role === 'employee' ? { carrierId: user.userID } : carrierId ? { carrierId } : {}),
      ...(q
        ? {
            OR: [
              { trackingNumber: { contains: q, mode: 'insensitive' } },
              { receiverName: { contains: q, mode: 'insensitive' } },
              { receiverPhone: { contains: q, mode: 'insensitive' } },
              { order: { orderCode: { contains: q, mode: 'insensitive' } } },
              {
                vendorOrder: {
                  vendorOrderCode: { contains: q, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const baseWhere: Prisma.ShipmentWhereInput = {
      ...(user?.role === 'employee' ? { carrierId: user.userID } : carrierId ? { carrierId } : {}),
      ...(q
        ? {
            OR: [
              { trackingNumber: { contains: q, mode: 'insensitive' } },
              { receiverName: { contains: q, mode: 'insensitive' } },
              { receiverPhone: { contains: q, mode: 'insensitive' } },
              { order: { orderCode: { contains: q, mode: 'insensitive' } } },
              {
                vendorOrder: {
                  vendorOrderCode: { contains: q, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [countPending, countInTransit, countDelivered, countTotal, totalItems, list] =
      await Promise.all([
        this.prisma.shipment.count({ where: { ...baseWhere, status: ShipmentStatus.pending } }),
        this.prisma.shipment.count({
          where: {
            ...baseWhere,
            status: {
              in: [
                ShipmentStatus.assigned,
                ShipmentStatus.picking_up,
                ShipmentStatus.in_transit,
                ShipmentStatus.out_for_delivery,
              ],
            },
          },
        }),
        this.prisma.shipment.count({
          where: { ...baseWhere, status: ShipmentStatus.delivered },
        }),
        this.prisma.shipment.count({ where: baseWhere }),
        this.prisma.shipment.count({ where }),
        this.prisma.shipment.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          include: {
            carrier: {
              select: {
                id: true,
                fullName: true,
                employeeCode: true,
                phone: true,
                department: true,
              },
            },
            order: {
              select: {
                id: true,
                orderCode: true,
                status: true,
                totalAmount: true,
                createdAt: true,
              },
            },
            vendorOrder: {
              select: {
                id: true,
                vendorOrderCode: true,
                status: true,
                totalAmount: true,
                vendor: {
                  select: {
                    id: true,
                    storeName: true,
                    fullName: true,
                  },
                },
              },
            },
            events: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        }),
      ]);

    const summary = {
      pending: countPending,
      inTransit: countInTransit,
      delivered: countDelivered,
      total: countTotal,
    };

    return {
      list,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      currentPage: page,
      summary,
    };
  }

  async getShipmentById(id: string, user?: UserInfo) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        carrier: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            phone: true,
            department: true,
          },
        },
        order: {
          include: {
            payment: true,
            details: {
              include: {
                productVariant: {
                  include: {
                    productColor: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        vendorOrder: {
          include: {
            vendor: {
              select: {
                id: true,
                storeName: true,
                fullName: true,
                phone: true,
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }
    this.assertAssigned(shipment, user);

    return shipment;
  }

  async updateShipmentStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
    user: UserInfo,
  ) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: { 
        order: { include: { payment: true } },
        carrier: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }
    await this.assertAssigned(shipment, user);
    if (shipment.status === dto.status) return shipment;
    if (shipment.order.status === OrderStatus.cancelled || shipment.order.status === OrderStatus.completed) {
      throw new BadRequestException('Đơn hàng đã kết thúc, không thể thay đổi vận đơn');
    }
    const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      pending: ['assigned', 'picking_up', 'failed', 'returned'],
      assigned: ['picking_up', 'in_transit', 'failed', 'returned'],
      picking_up: ['in_transit', 'out_for_delivery', 'failed', 'returned'],
      in_transit: ['out_for_delivery', 'delivered', 'failed', 'returned'],
      out_for_delivery: ['delivered', 'failed', 'returned'],
      failed: ['assigned', 'picking_up', 'out_for_delivery', 'returned'],
      delivered: [], returned: [],
    };
    if (!transitions[shipment.status].includes(dto.status)) throw new BadRequestException(`Không thể chuyển vận đơn từ ${shipment.status} sang ${dto.status}`);
    if (shipment.order.status === OrderStatus.pending && !['failed', 'returned'].includes(dto.status)) throw new BadRequestException('Chờ xác nhận đơn hàng trước khi vận chuyển');
    if (dto.status === ShipmentStatus.returned) {
      await this.orders.updateStatus(shipment.orderId, { status: OrderStatus.cancelled, note: dto.description || dto.failedReason || 'Hoàn hàng về kho' }, user);
      const returned = await this.prisma.shipment.findUniqueOrThrow({ where: { id } });
      await this.emitShipment(returned);
      return returned;
    }

    const defaultDescriptions: Record<string, string> = {
      pending: 'Vận đơn đang chờ tiếp nhận',
      assigned: 'Đã phân công nhân viên điều phối vận chuyển',
      picking_up: 'Nhân viên đang lấy hàng tại kho nhà bán hàng (Vendor)',
      in_transit: 'Kiện hàng đang được luân chuyển tại Hub phân loại MIVA',
      out_for_delivery: 'Nhân viên đang trên đường giao hàng đến người nhận',
      delivered: 'Kiện hàng đã giao thành công cho khách hàng',
      failed: `Giao hàng không thành công: ${dto.failedReason || 'Không liên lạc được người nhận'}`,
      returned: 'Kiện hàng đã được hoàn trả về kho',
    };

    const isDelivered = dto.status === 'delivered';

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedShipment = await tx.shipment.update({
        where: { id, status: shipment.status },
        data: {
          status: dto.status as ShipmentStatus,
          notes: dto.notes !== undefined ? dto.notes : shipment.notes,
          failedReason: dto.failedReason || null,
          deliveredAt: isDelivered ? new Date() : shipment.deliveredAt,
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: id,
          status: dto.status as ShipmentStatus,
          location: dto.location || 'MIVA Logistics Hub',
          description: dto.description || defaultDescriptions[dto.status] || 'Cập nhật trạng thái vận đơn',
          actorRole: user.role,
          actorId: user.userID,
        },
      });

      // Update parent Order if all shipments delivered
      if (isDelivered) {
        if (shipment.vendorOrderId) {
          await tx.vendorOrder.update({
            where: { id: shipment.vendorOrderId },
            data: { status: 'delivered' },
          });
        }

        const allShipments = await tx.shipment.findMany({
          where: { orderId: shipment.orderId },
        });

        const allDelivered = allShipments.every(
          (s) => s.id === id || s.status === ShipmentStatus.delivered,
        );

        if (allDelivered) {
          await tx.order.update({
            where: { id: shipment.orderId },
            data: { status: OrderStatus.completed },
          });

          if (
            shipment.order.payment?.method === PaymentMethod.cod &&
            shipment.order.payment.status === PaymentStatus.pending
          ) {
            await tx.payment.update({
              where: { orderId: shipment.orderId },
              data: { status: PaymentStatus.paid, paidAt: new Date() },
            });
          }

          let carrierDisplay = 'nhân viên vận chuyển';
          if (shipment.carrier?.fullName) {
            carrierDisplay = `${shipment.carrier.fullName} / ${shipment.carrier.employeeCode || shipment.carrier.id.slice(0, 8)}`;
          } else if (user.role === 'employee') {
            const emp = await tx.employee.findUnique({ where: { id: user.userID } });
            if (emp) {
              carrierDisplay = `${emp.fullName} / ${emp.employeeCode}`;
            } else {
              carrierDisplay = user.fullName || user.userID;
            }
          } else {
            carrierDisplay = user.fullName || user.userID;
          }

          await tx.orderStatusHistory.create({
            data: {
              orderId: shipment.orderId,
              fromStatus: shipment.order.status,
              toStatus: OrderStatus.completed,
              note: `Toàn bộ các kiện hàng đã được giao thành công bởi nhân viên [${carrierDisplay}]`,
              ...(user.role === 'admin' ? { adminId: user.userID } : {}),
              ...(user.role === 'employee' ? { employeeId: user.userID } : {}),
            },
          });
        }
      } else if (dto.status === 'out_for_delivery' || dto.status === 'in_transit') {
        if (shipment.vendorOrderId) {
          await tx.vendorOrder.update({
            where: { id: shipment.vendorOrderId },
            data: { status: 'shipping' },
          });
        }
        if (shipment.order.status === OrderStatus.confirmed || shipment.order.status === OrderStatus.processing) {
          await tx.order.update({
            where: { id: shipment.orderId },
            data: { status: OrderStatus.shipping },
          });
        }
      } else if (dto.status === 'returned') {
        if (shipment.vendorOrderId) {
          await tx.vendorOrder.update({
            where: { id: shipment.vendorOrderId },
            data: { status: 'cancelled' },
          });
        }
      }

      // Khi phát sinh sự cố giao hàng thất bại (failed) hoặc hoàn trả (returned):
      // Tự động chuyển giao hồ sơ tới Bộ phận Xử lý Sự cố & Ngoại lệ Đơn
      let exceptionEmp: { id: string; fullName: string; employeeCode: string; department: string } | null = null;
      if (dto.status === 'failed' || dto.status === 'returned') {
        try {
          exceptionEmp = await this.orders.findBestExceptionEmployee(tx);
        } catch {
          // ignore in mock environments
        }

        if (exceptionEmp) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: shipment.orderId,
              employeeId: exceptionEmp.id,
              fromStatus: shipment.order.status,
              toStatus: shipment.order.status,
              note: `[Sự cố vận đơn] Vận đơn #${shipment.trackingNumber} phát sinh sự cố (${dto.failedReason || defaultDescriptions[dto.status] || 'Sự cố giao nhận'}). Hồ sơ sự cố được chuyển tới chuyên viên [${exceptionEmp.fullName} / ${exceptionEmp.employeeCode}] (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) giải quyết`,
            },
          });
        }
      }

      return { updatedShipment, exceptionEmp };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }).catch(error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2034', 'P2025'].includes(error.code)) {
        throw new ConflictException('Vận đơn vừa thay đổi, vui lòng tải lại và thử lại');
      }
      throw error;
    });

    await this.emitShipment(result.updatedShipment);
    if (result.exceptionEmp) {
      this.realtime.emitToUser(result.exceptionEmp.id, 'order:exception', {
        orderId: shipment.orderId,
        shipmentId: id,
        trackingNumber: shipment.trackingNumber,
        reason: dto.failedReason || 'Giao hàng không thành công',
      });
      this.realtime.emitToEmployees('order:exception', {
        orderId: shipment.orderId,
        shipmentId: id,
      });
    }
    return result.updatedShipment;
  }

  async assignCarrier(id: string, dto: AssignCarrierDto, user: UserInfo) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });
    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }

    const carrier = await this.prisma.employee.findUnique({
      where: { id: dto.carrierId },
      select: { id: true, fullName: true, employeeCode: true, phone: true, department: true },
    });

    if (!carrier) {
      throw new NotFoundException('Không tìm thấy nhân viên vận chuyển');
    }
    if (user.role !== 'admin') throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');
    if (['in_transit', 'out_for_delivery', 'delivered', 'returned'].includes(shipment.status)) {
      throw new BadRequestException('Không thể phân công lại vận đơn đang giao hoặc đã kết thúc');
    }
    const activeCarrier = await this.prisma.employee.count({ where: { id: carrier.id, status: 'active', deletedAt: null } });
    if (!activeCarrier) throw new BadRequestException('Nhân viên không còn hoạt động');

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id },
        data: {
          carrierId: carrier.id,
          carrierType: dto.carrierType || 'employee',
          status: ShipmentStatus.assigned,
          notes: dto.notes ? `${shipment.notes ? shipment.notes + '\n' : ''}${dto.notes}` : shipment.notes,
        },
      });

      await tx.shipmentEvent.create({
        data: {
          shipmentId: id,
          status: ShipmentStatus.assigned,
          location: 'Văn phòng điều phối MIVA',
          description: `Đã phân công vận chuyển cho nhân sự ${carrier.fullName} (${carrier.employeeCode}) - ${carrier.department || 'Phòng Vận chuyển & Giao nhận'}`,
          actorRole: user.role,
          actorId: user.userID,
        },
      });

      const parentOrder = await tx.order.findUnique({
        where: { id: shipment.orderId },
        select: { status: true },
      });
      if (parentOrder) {
        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.orderId,
            employeeId: carrier.id,
            adminId: user.userID,
            fromStatus: parentOrder.status,
            toStatus: parentOrder.status,
            note: `[Chỉ định Bưu tá] Admin đã phân công bưu tá [${carrier.fullName} / ${carrier.employeeCode}] (${carrier.department || 'Phòng Vận chuyển & Giao nhận'}) phụ trách vận chuyển giao nhận${dto.notes ? `. Ghi chú: ${dto.notes}` : ''}`,
          },
        });
      }

      return s;
    });

    await this.emitShipment(updated);
    this.realtime.emitToAdmins('order:updated', { orderId: shipment.orderId });
    this.realtime.emitToEmployees('order:updated', { orderId: shipment.orderId });
    return updated;
  }

  async randomAssignCarrier(id: string, user: UserInfo) {
    if (user.role !== 'admin') throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');

    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
    });
    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }
    if (['in_transit', 'out_for_delivery', 'delivered', 'returned'].includes(shipment.status)) {
      throw new BadRequestException('Không thể phân công lại vận đơn đang giao hoặc đã kết thúc');
    }

    // Ưu tiên nhân viên thuộc phòng ban vận chuyển
    let shippingEmployees = await this.prisma.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        department: { contains: 'Vận chuyển', mode: 'insensitive' },
      },
      select: { id: true, fullName: true, employeeCode: true, phone: true },
    });

    if (!shippingEmployees.length) {
      shippingEmployees = await this.prisma.employee.findMany({
        where: { status: 'active', deletedAt: null },
        select: { id: true, fullName: true, employeeCode: true, phone: true },
      });
    }

    if (!shippingEmployees.length) {
      throw new NotFoundException('Không tìm thấy nhân viên vận chuyển nào đang hoạt động');
    }

    const randomCarrier = shippingEmployees[Math.floor(Math.random() * shippingEmployees.length)];
    return this.assignCarrier(id, { carrierId: randomCarrier.id, carrierType: 'employee' }, user);
  }

  async randomAssignAll(user: UserInfo) {
    if (user.role !== 'admin') throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');

    const unassignedShipments = await this.prisma.shipment.findMany({
      where: {
        carrierId: null,
        status: { in: [ShipmentStatus.pending, ShipmentStatus.assigned] },
      },
    });

    if (!unassignedShipments.length) {
      return { success: true, count: 0, message: 'Tất cả các vận đơn hợp lệ đã được phân công' };
    }

    let shippingEmployees = await this.prisma.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        department: { contains: 'Vận chuyển', mode: 'insensitive' },
      },
      select: { id: true, fullName: true, employeeCode: true, phone: true },
    });

    if (!shippingEmployees.length) {
      shippingEmployees = await this.prisma.employee.findMany({
        where: { status: 'active', deletedAt: null },
        select: { id: true, fullName: true, employeeCode: true, phone: true },
      });
    }

    if (!shippingEmployees.length) {
      throw new NotFoundException('Không tìm thấy nhân viên vận chuyển nào đang hoạt động');
    }

    let count = 0;
    for (const ship of unassignedShipments) {
      const randomCarrier = shippingEmployees[Math.floor(Math.random() * shippingEmployees.length)];
      await this.assignCarrier(ship.id, { carrierId: randomCarrier.id, carrierType: 'employee' }, user);
      count++;
    }

    return { success: true, count, message: `Đã phân công ngẫu nhiên cho ${count} vận đơn` };
  }

  private async emitShipment(shipment: { id: string; orderId: string; status: ShipmentStatus; carrierId: string | null }) {
    const payload = { shipmentId: shipment.id, orderId: shipment.orderId, status: shipment.status };
    this.realtime.emitToAdmins('shipment:updated', payload);
    this.realtime.emitToEmployees('shipment:updated', payload);
    if (shipment.carrierId) this.realtime.emitToUser(shipment.carrierId, 'shipment:updated', payload);
    const order = await this.prisma.order.findUnique({
      where: { id: shipment.orderId },
      select: { clientId: true, vendorOrders: { select: { vendorId: true } } },
    });
    if (order) {
      this.realtime.emitToUser(order.clientId, 'shipment:updated', payload);
      for (const { vendorId } of order.vendorOrders) {
        this.realtime.emitToVendor(vendorId, 'shipment:updated', payload);
      }
    }
  }

  private async assertAssigned(shipment: { carrierId: string | null }, user?: UserInfo) {
    if (user?.role === 'employee') {
      const emp = await this.prisma.employee.findUnique({
        where: { id: user.userID },
        select: { department: true },
      });
      if (!emp?.department?.includes('Vận chuyển')) {
        throw new ForbiddenException(
          'Chỉ nhân viên thuộc Phòng Vận chuyển & Giao nhận mới có quyền tiếp nhận và cập nhật vận đơn',
        );
      }
      if (shipment.carrierId !== user.userID) {
        throw new ForbiddenException('Bạn chỉ được xem và xử lý vận đơn được phân công cho mình');
      }
    }
  }
}
