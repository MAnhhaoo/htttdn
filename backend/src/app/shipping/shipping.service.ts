import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
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
import {
  NotificationsService,
  type OrderNotificationInput,
  SHIPMENT_STATUS_LABELS,
} from '../notifications/notifications.service';
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
    @Optional() private readonly notifications?: NotificationsService,
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

      if (!isShippingDept(emp.department)) {
        throw new ForbiddenException(
          'Chỉ nhân viên thuộc Phòng Vận chuyển & Giao nhận (Bưu tá) mới quản lý phần giao hàng',
        );
      }

      // [QUY TẮC BƯU TÁ]: Mọi bưu tá chỉ quản lý phần giao hàng của các kiện hàng được phân công cho mình (carrierId)
      andConditions.push({ carrierId: emp.id });
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
        const [, remainingUndelivered] = await Promise.all([
          shipment.vendorOrderId
            ? tx.vendorOrder.update({
                where: { id: shipment.vendorOrderId },
                data: { status: 'delivered' },
              })
            : Promise.resolve(null),
          tx.shipment.count({
            where: {
              orderId: shipment.orderId,
              id: { not: id },
              status: { not: ShipmentStatus.delivered },
            },
          }),
        ]);

        const allDelivered = remainingUndelivered === 0;

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

    if (this.notifications) {
      const shipLabel = SHIPMENT_STATUS_LABELS[dto.status] || dto.status;
      const orderCode = shipment.order.orderCode;
      const reasonSuffix = dto.failedReason ? ` (${dto.failedReason})` : '';
      const shipNotifs: OrderNotificationInput[] = [];

      if (shipment.order.clientId) {
        shipNotifs.push({
          clientId: shipment.order.clientId,
          title: `Cập nhật giao hàng #${orderCode}`,
          content: `Vận đơn ${shipment.trackingNumber} (đơn #${orderCode}) đã chuyển sang trạng thái "${shipLabel}"${reasonSuffix}.`,
          data: {
            orderId: shipment.orderId,
            orderCode,
            shipmentId: id,
            trackingNumber: shipment.trackingNumber,
            status: dto.status,
            event: 'shipment_updated',
          },
        });
      }

      if (shipment.vendorOrder?.vendorId) {
        shipNotifs.push({
          vendorId: shipment.vendorOrder.vendorId,
          title: `Vận đơn #${shipment.trackingNumber}: ${shipLabel}`,
          content: `Bưu tá đã cập nhật vận đơn ${shipment.trackingNumber} (đơn #${orderCode}) sang trạng thái "${shipLabel}"${reasonSuffix}.`,
          data: {
            orderId: shipment.orderId,
            orderCode,
            shipmentId: id,
            trackingNumber: shipment.trackingNumber,
            status: dto.status,
            event: 'shipment_updated',
          },
        });
      }

      if (
        shipment.order.assignedEmployeeId &&
        !(user.role === 'employee' && user.userID === shipment.order.assignedEmployeeId)
      ) {
        shipNotifs.push({
          employeeId: shipment.order.assignedEmployeeId,
          title: `Vận đơn #${shipment.trackingNumber}: ${shipLabel}`,
          content: `Vận đơn ${shipment.trackingNumber} thuộc đơn #${orderCode} đã cập nhật: "${shipLabel}"${reasonSuffix}.`,
          data: {
            orderId: shipment.orderId,
            orderCode,
            shipmentId: id,
            trackingNumber: shipment.trackingNumber,
            status: dto.status,
            event: 'shipment_updated',
          },
        });
      }

      if (result.exceptionEmp) {
        shipNotifs.push({
          employeeId: result.exceptionEmp.id,
          title: `Sự cố vận đơn #${shipment.trackingNumber}`,
          content: `Vận đơn ${shipment.trackingNumber} (đơn #${orderCode}) phát sinh sự cố${reasonSuffix || `: ${shipLabel}`}. Hồ sơ đã chuyển cho bạn xử lý.`,
          data: {
            orderId: shipment.orderId,
            orderCode,
            shipmentId: id,
            trackingNumber: shipment.trackingNumber,
            status: dto.status,
            event: 'shipment_exception',
          },
        });
      }

      await this.notifications.notifyOrderUpdates(shipNotifs);
    }
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
      trackingNumber?: string;
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
    const { updated, parentOrder } = await this.prisma.extendedTransaction(
      async (tx) => {
        const [s, , orderInfo] = await Promise.all([
          tx.shipment.update({
            where: { id },
            data: {
              carrierId: carrier.id,
              carrierType: dto.carrierType || 'employee',
              status: ShipmentStatus.assigned,
              notes: dto.notes
                ? `${shipment.notes ? shipment.notes + '\n' : ''}${dto.notes}`
                : shipment.notes,
            },
          }),
          tx.shipmentEvent.create({
            data: {
              shipmentId: id,
              status: ShipmentStatus.assigned,
              location: 'Văn phòng điều phối MIVA',
              description: `Đã phân công vận chuyển cho nhân sự ${carrier.fullName} (${carrier.employeeCode}) - ${carrier.department || 'Phòng Vận chuyển & Giao nhận'}`,
              actorRole: user.role,
              actorId: user.userID,
            },
          }),
          tx.order.findUnique({
            where: { id: shipment.orderId },
            select: {
              status: true,
              clientId: true,
              vendorOrders: { select: { vendorId: true } },
            },
          }),
        ]);

        if (orderInfo) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: shipment.orderId,
              employeeId: carrier.id,
              adminId: user.userID,
              fromStatus: orderInfo.status,
              toStatus: orderInfo.status,
              note: `[Chỉ định Bưu tá] Admin đã phân công bưu tá [${carrier.fullName} / ${carrier.employeeCode}] (${carrier.department || 'Phòng Vận chuyển & Giao nhận'}) phụ trách vận chuyển giao nhận${dto.notes ? `. Ghi chú: ${dto.notes}` : ''}`,
            },
          });
        }

        return { updated: s, parentOrder: orderInfo };
      },
    );

    await this.emitShipment(updated, parentOrder);
    this.realtime.emitToAdmins('order:updated', { orderId: shipment.orderId });
    this.realtime.emitToEmployees('order:updated', { orderId: shipment.orderId });
    if (this.notifications) {
      const trackingCode = updated.trackingNumber || shipment.trackingNumber || shipment.id;
      await this.notifications.notifyOrderUpdates([
        {
          employeeId: carrier.id,
          title: `Phân công giao vận đơn #${trackingCode}`,
          content: `Admin vừa phân công bạn phụ trách giao vận đơn ${trackingCode}${dto.notes ? `. Ghi chú: ${dto.notes}` : ''}.`,
          data: {
            orderId: shipment.orderId,
            shipmentId: shipment.id,
            trackingNumber: trackingCode,
            event: 'shipment_assigned',
          },
        },
      ]);
    }
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
        select: {
          id: true,
          orderId: true,
          trackingNumber: true,
          notes: true,
          order: {
            select: {
              status: true,
              clientId: true,
              vendorOrders: { select: { vendorId: true } },
            },
          },
        },
        take: 200,
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

    const assignments = unassignedShipments
      .map((ship) => ({
        ship,
        carrier: pickNextShipperFromPool(shipperPool),
      }))
      .filter(
        (
          item,
        ): item is {
          ship: (typeof unassignedShipments)[number];
          carrier: NonNullable<ReturnType<typeof pickNextShipperFromPool>>;
        } => Boolean(item.carrier),
      );

    const CHUNK_SIZE = 50;
    for (let i = 0; i < assignments.length; i += CHUNK_SIZE) {
      const chunk = assignments.slice(i, i + CHUNK_SIZE);
      await this.prisma.extendedTransaction(async (tx) => {
        await Promise.all([
          ...chunk.map(({ ship, carrier }) =>
            tx.shipment.update({
              where: { id: ship.id },
              data: {
                carrierId: carrier.id,
                carrierType: 'employee',
                status: ShipmentStatus.assigned,
              },
            }),
          ),
          tx.shipmentEvent.createMany({
            data: chunk.map(({ ship, carrier }) => ({
              shipmentId: ship.id,
              status: ShipmentStatus.assigned,
              location: 'Văn phòng điều phối MIVA',
              description: `Đã phân công vận chuyển cho nhân sự ${carrier.fullName} (${carrier.employeeCode}) - ${carrier.department || 'Phòng Vận chuyển & Giao nhận'}`,
              actorRole: user.role,
              actorId: user.userID,
            })),
          }),
          tx.orderStatusHistory.createMany({
            data: chunk
              .filter(({ ship }) => Boolean(ship.order))
              .map(({ ship, carrier }) => ({
                orderId: ship.orderId,
                employeeId: carrier.id,
                adminId: user.userID,
                fromStatus: ship.order.status,
                toStatus: ship.order.status,
                note: `[Chỉ định Bưu tá] Admin đã phân công bưu tá [${carrier.fullName} / ${carrier.employeeCode}] (${carrier.department || 'Phòng Vận chuyển & Giao nhận'}) phụ trách vận chuyển giao nhận`,
              })),
          }),
        ]);
      });

      for (const { ship, carrier } of chunk) {
        await this.emitShipment(
          {
            id: ship.id,
            orderId: ship.orderId,
            status: ShipmentStatus.assigned,
            carrierId: carrier.id,
          },
          ship.order,
        );
        this.realtime.emitToAdmins('order:updated', { orderId: ship.orderId });
        this.realtime.emitToEmployees('order:updated', { orderId: ship.orderId });
      }
      if (this.notifications) {
        await this.notifications.notifyOrderUpdates(
          chunk.map(({ ship, carrier }) => ({
            employeeId: carrier.id,
            title: `Phân công giao vận đơn #${ship.trackingNumber}`,
            content: `Admin vừa phân công bạn phụ trách giao vận đơn ${ship.trackingNumber}.`,
            data: {
              orderId: ship.orderId,
              shipmentId: ship.id,
              trackingNumber: ship.trackingNumber,
              event: 'shipment_assigned',
            },
          })),
        );
      }
    }

    const count = assignments.length;
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

  private async emitShipment(
    shipment: { id: string; orderId: string; status: ShipmentStatus; carrierId: string | null },
    preloadedOrder?: { clientId: string; vendorOrders: Array<{ vendorId: string }> } | null,
  ) {
    const payload = { shipmentId: shipment.id, orderId: shipment.orderId, status: shipment.status };
    this.realtime.emitToAdmins('shipment:updated', payload);
    this.realtime.emitToEmployees('shipment:updated', payload);
    if (shipment.carrierId) this.realtime.emitToUser(shipment.carrierId, 'shipment:updated', payload);
    const order =
      preloadedOrder !== undefined
        ? preloadedOrder
        : await this.prisma.extended.order.findUnique({
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
