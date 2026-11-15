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
import {
  CARRIER_SUMMARY_SELECT,
  PRODUCT_VARIANT_SUMMARY_SELECT,
  VENDOR_SUMMARY_SELECT,
} from 'src/common/prisma/prisma-selects.const';
import {
  formatPaginatedList,
  normalizePagination,
} from 'src/common/utils/paginaton-util/pagintion-util.service';
import { RealtimeService } from '../realtime/realtime.service';
import { DEPARTMENT_KEYWORDS, OrdersService } from '../orders/orders.service';
import {
  ACTIVE_SHIPMENT_STATUSES,
  isShippingDept,
  loadShipperPoolWithLoads,
  pickNextShipperFromPool,
} from '../orders/order-assignment.helper';
import {
  AssignCarrierDto,
  GetShipmentsQueryDto,
  UpdateShipmentStatusDto,
} from './dto/shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly orders: OrdersService,
  ) {}

  async listShipments(query: GetShipmentsQueryDto, user?: UserInfo) {
    const { q, status, carrierId } = query;
    const { page, itemPerPage, skip } = normalizePagination({
      page: query.page,
      itemPerPage: query.itemPerPage,
    });

    const andConditions: Prisma.ShipmentWhereInput[] = [];

    if (user?.role === 'employee') {
      const emp = await this.prisma.extended.employee.findUnique({
        where: { id: user.userID },
        select: { id: true, department: true, assignedOrderScope: true },
      });

      if (!emp) {
        throw new ForbiddenException('Không tìm thấy thông tin nhân viên');
      }

      if (
        !isShippingDept(emp.department) &&
        emp.assignedOrderScope !== 'all_orders'
      ) {
        throw new ForbiddenException(
          'Chỉ nhân viên thuộc Phòng Vận chuyển & Giao nhận (Bưu tá) mới quản lý phần giao hàng',
        );
      }

      if (emp.assignedOrderScope === 'all_orders') {
        if (carrierId) {
          andConditions.push({ carrierId });
        }
      } else {
        // [QUY TẮC BƯU TÁ]: Bưu tá chỉ quản lý phần giao hàng của các kiện hàng được phân công cho mình (carrierId)
        andConditions.push({ carrierId: emp.id });
      }
    } else if (carrierId) {
      andConditions.push({ carrierId });
    }

    if (q) {
      andConditions.push({
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
      });
    }

    const baseWhere: Prisma.ShipmentWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const where: Prisma.ShipmentWhereInput = {
      ...baseWhere,
      ...(status ? { status: status as ShipmentStatus } : {}),
    };

    const [groupedByStatus, list] = await Promise.all([
      this.prisma.extended.shipment.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
      this.prisma.extended.shipment.findMany({
        where,
        skip,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
        include: {
          carrier: {
            select: CARRIER_SUMMARY_SELECT,
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

    const statusCountMap = new Map<ShipmentStatus, number>();
    let countTotal = 0;
    for (const row of groupedByStatus) {
      const c = Number(row._count?._all ?? 0);
      statusCountMap.set(row.status, c);
      countTotal += c;
    }

    const countPending = statusCountMap.get(ShipmentStatus.pending) ?? 0;
    const countInTransit = ACTIVE_SHIPMENT_STATUSES.reduce(
      (sum, st) => sum + (statusCountMap.get(st) ?? 0),
      0,
    );
    const countDelivered = statusCountMap.get(ShipmentStatus.delivered) ?? 0;
    const totalItems = status
      ? (statusCountMap.get(status as ShipmentStatus) ?? 0)
      : countTotal;

    const summary = {
      pending: countPending,
      inTransit: countInTransit,
      delivered: countDelivered,
      total: countTotal,
    };

    return {
      ...formatPaginatedList(list, totalItems, { page, itemPerPage }),
      summary,
    };
  }

  async getShipmentById(id: string, user?: UserInfo) {
    const shipment = await this.prisma.extended.shipment.findUnique({
      where: { id },
      include: {
        carrier: {
          select: CARRIER_SUMMARY_SELECT,
        },
        order: {
          include: {
            payment: true,
            statusHistory: true,
            details: {
              include: {
                productVariant: {
                  select: PRODUCT_VARIANT_SUMMARY_SELECT,
                },
              },
            },
          },
        },
        vendorOrder: {
          include: {
            vendor: {
              select: VENDOR_SUMMARY_SELECT,
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
    await this.assertAssigned(shipment, user);

    if (
      user?.role === 'employee' &&
      shipment.vendorOrderId &&
      Array.isArray(shipment.order?.details)
    ) {
      const hasTaggedDetails = shipment.order.details.some((d: any) =>
        Boolean(d.vendorOrderId),
      );
      if (hasTaggedDetails) {
        return {
          ...shipment,
          order: {
            ...shipment.order,
            details: shipment.order.details.filter(
              (d: any) =>
                !d.vendorOrderId || d.vendorOrderId === shipment.vendorOrderId,
            ),
          },
        };
      }
    }

    return shipment;
  }

  async updateShipmentStatus(
    id: string,
    dto: UpdateShipmentStatusDto,
    user: UserInfo,
  ) {
    const shipment = await this.prisma.extended.shipment.findUnique({
      where: { id },
      include: {
        order: { include: { payment: true } },
        vendorOrder: true,
        carrier: { select: CARRIER_SUMMARY_SELECT },
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
      delivered: [],
      returned: [],
    };
    if (!transitions[shipment.status].includes(dto.status)) {
      throw new BadRequestException(`Không thể chuyển vận đơn từ ${shipment.status} sang ${dto.status}`);
    }
    if (shipment.order.status === OrderStatus.pending && !['failed', 'returned'].includes(dto.status)) {
      throw new BadRequestException('Chờ xác nhận đơn hàng trước khi vận chuyển');
    }

    // [QUY TẮC BÀN GIAO VENDOR]: Vendor phải xác nhận đóng gói xong (ready_for_pickup) thì bưu tá mới có thể tiếp nhận và lấy đơn
    if (
      dto.status === ShipmentStatus.picking_up ||
      dto.status === ShipmentStatus.in_transit ||
      dto.status === ShipmentStatus.out_for_delivery
    ) {
      if (
        shipment.vendorOrder &&
        !['ready_for_pickup', 'shipping', 'delivered'].includes(shipment.vendorOrder.status)
      ) {
        throw new BadRequestException(
          'Vendor chưa xác nhận đóng gói xong kiện hàng. Bưu tá chỉ có thể tiếp nhận sau khi Vendor hoàn tất đóng gói và sẵn sàng bàn giao.',
        );
      }
    }
    if (dto.status === ShipmentStatus.returned) {
      await this.orders.updateStatus(
        shipment.orderId,
        { status: OrderStatus.cancelled, note: dto.description || dto.failedReason || 'Hoàn hàng về kho' },
        user,
      );
      const returned = await this.prisma.extended.shipment.findUniqueOrThrow({ where: { id } });
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

    const result = await this.prisma.extendedTransaction(async (tx) => {
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
      let surveyNotifications: Awaited<
        ReturnType<OrdersService['deliverOrderCompletedSurveys']>
      > = [];
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

          surveyNotifications = await this.orders.deliverOrderCompletedSurveys(
            tx,
            shipment.orderId,
          );
        }
      } else if (dto.status === 'out_for_delivery' || dto.status === 'in_transit' || dto.status === 'picking_up') {
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
        exceptionEmp = await this.orders.findBestExceptionEmployee(tx);

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

      return { updatedShipment, exceptionEmp, surveyNotifications };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }).catch(error => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2034', 'P2025'].includes(error.code)) {
        throw new ConflictException('Vận đơn vừa thay đổi, vui lòng tải lại và thử lại');
      }
      throw error;
    });

    await this.emitShipment(result.updatedShipment);
    this.orders.emitSurveyNotifications(result.surveyNotifications);
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
    if (user.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');
    }

    const [shipment, carrier] = await Promise.all([
      this.prisma.extended.shipment.findUnique({
        where: { id },
      }),
      this.prisma.extended.employee.findUnique({
        where: { id: dto.carrierId },
        select: {
          id: true,
          fullName: true,
          employeeCode: true,
          phone: true,
          department: true,
          status: true,
          deletedAt: true,
        },
      }),
    ]);

    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }
    if (!carrier) {
      throw new NotFoundException('Không tìm thấy nhân viên vận chuyển');
    }
    if (
      ['in_transit', 'out_for_delivery', 'delivered', 'returned'].includes(
        shipment.status,
      )
    ) {
      throw new BadRequestException(
        'Không thể phân công lại vận đơn đang giao hoặc đã kết thúc',
      );
    }
    if (carrier.status !== 'active' || carrier.deletedAt) {
      throw new BadRequestException('Nhân viên không còn hoạt động');
    }

    return this.executeAssignCarrier(shipment, carrier, dto, user);
  }

  private async executeAssignCarrier(
    shipment: {
      id: string;
      orderId: string;
      status: ShipmentStatus;
      notes: string | null;
    },
    carrier: {
      id: string;
      fullName: string;
      employeeCode: string;
      department?: string | null;
    },
    dto: AssignCarrierDto,
    user: UserInfo,
  ) {
    const id = shipment.id;
    const updated = await this.prisma.extendedTransaction(async (tx) => {
      const s = await tx.shipment.update({
        where: { id },
        data: {
          carrierId: carrier.id,
          carrierType: dto.carrierType || 'employee',
          status: ShipmentStatus.assigned,
          notes: dto.notes
            ? `${shipment.notes ? shipment.notes + '\n' : ''}${dto.notes}`
            : shipment.notes,
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
    if (user.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');
    }

    const [shipment, shipperPool] = await Promise.all([
      this.prisma.extended.shipment.findUnique({
        where: { id },
      }),
      loadShipperPoolWithLoads(this.prisma.extended, {
        fallbackToAnyActive: true,
      }),
    ]);
    if (!shipment) {
      throw new NotFoundException('Không tìm thấy vận đơn');
    }
    if (
      ['in_transit', 'out_for_delivery', 'delivered', 'returned'].includes(
        shipment.status,
      )
    ) {
      throw new BadRequestException(
        'Không thể phân công lại vận đơn đang giao hoặc đã kết thúc',
      );
    }

    const chosen = pickNextShipperFromPool(shipperPool);
    if (!chosen) {
      throw new NotFoundException(
        'Không tìm thấy nhân viên vận chuyển nào đang hoạt động',
      );
    }

    return this.executeAssignCarrier(
      shipment,
      chosen,
      { carrierId: chosen.id, carrierType: 'employee' },
      user,
    );
  }

  async randomAssignAll(user: UserInfo) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Chỉ Admin được phân công vận chuyển');
    }

    const [unassignedShipments, shipperPool] = await Promise.all([
      this.prisma.extended.shipment.findMany({
        where: {
          carrierId: null,
          status: { in: [ShipmentStatus.pending, ShipmentStatus.assigned] },
        },
      }),
      loadShipperPoolWithLoads(this.prisma.extended, {
        fallbackToAnyActive: true,
      }),
    ]);

    if (!unassignedShipments.length) {
      return {
        success: true,
        count: 0,
        message: 'Tất cả các vận đơn hợp lệ đã được phân công',
      };
    }

    if (!shipperPool.candidates.length) {
      throw new NotFoundException(
        'Không tìm thấy nhân viên vận chuyển nào đang hoạt động',
      );
    }

    let count = 0;
    for (const ship of unassignedShipments) {
      const carrier = pickNextShipperFromPool(shipperPool);
      if (!carrier) break;
      await this.executeAssignCarrier(
        ship,
        carrier,
        { carrierId: carrier.id, carrierType: 'employee' },
        user,
      );
      count++;
    }

    return {
      success: true,
      count,
      message: `Đã phân công ngẫu nhiên cho ${count} vận đơn`,
    };
  }

  /**
   * Nhân viên đang hoạt động thuộc phòng ban vận chuyển, nếu không có thì dùng mọi nhân viên đang hoạt động.
   */
  private async listShippingEmployees() {
    let shippingEmployees = await this.prisma.extended.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        department: { contains: DEPARTMENT_KEYWORDS.SHIPPING, mode: 'insensitive' },
      },
      select: { id: true, fullName: true, employeeCode: true, phone: true },
    });

    if (!shippingEmployees.length) {
      shippingEmployees = await this.prisma.extended.employee.findMany({
        where: { status: 'active', deletedAt: null },
        select: { id: true, fullName: true, employeeCode: true, phone: true },
      });
    }

    if (!shippingEmployees.length) {
      throw new NotFoundException('Không tìm thấy nhân viên vận chuyển nào đang hoạt động');
    }

    return shippingEmployees;
  }

  private async emitShipment(shipment: { id: string; orderId: string; status: ShipmentStatus; carrierId: string | null }) {
    const payload = { shipmentId: shipment.id, orderId: shipment.orderId, status: shipment.status };
    this.realtime.emitToAdmins('shipment:updated', payload);
    this.realtime.emitToEmployees('shipment:updated', payload);
    if (shipment.carrierId) this.realtime.emitToUser(shipment.carrierId, 'shipment:updated', payload);
    const order = await this.prisma.extended.order.findUnique({
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

  private async assertAssigned(
    shipment: {
      carrierId: string | null;
      orderId?: string;
    },
    user?: UserInfo,
  ) {
    if (!user || user.role === 'admin') return;

    if (user.role === 'employee') {
      const emp = await this.prisma.extended.employee.findUnique({
        where: { id: user.userID },
        select: { id: true, department: true, assignedOrderScope: true },
      });

      if (!emp) {
        throw new ForbiddenException('Không tìm thấy thông tin nhân viên');
      }

      // Quản lý được xem và xử lý toàn bộ
      if (emp.assignedOrderScope === 'all_orders') {
        return;
      }

      // Chỉ nhân viên thuộc Phòng Vận chuyển & Giao nhận (Bưu tá) mới quản lý phần giao hàng
      if (
        !emp.department?.includes(DEPARTMENT_KEYWORDS.SHIPPING) &&
        !emp.department?.includes(DEPARTMENT_KEYWORDS.DELIVERY)
      ) {
        throw new ForbiddenException(
          'Chỉ nhân viên thuộc Phòng Vận chuyển & Giao nhận (Bưu tá) mới quản lý phần giao hàng',
        );
      }

      // Bưu tá chỉ được xem và cập nhật kiện hàng phân công cho mình
      if (shipment.carrierId !== user.userID) {
        throw new ForbiddenException('Bạn chỉ được xem và xử lý vận đơn được phân công cho mình');
      }
    }
  }
}
