import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException} from '@nestjs/common';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ShipmentStatus,
  SurveyResponseStatus,
  SurveyTriggerType,
  VendorOrderStatus,
  VoucherScope} from '@prisma/client';

import type { UserInfo } from 'src/common/decorators/user.decorator';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { RealtimeService } from 'src/app/realtime/realtime.service';
import { SurveysService } from 'src/app/surveys/surveys.service';
import { VouchersService } from 'src/app/vouchers/vouchers.service';
import { CheckoutDto, PreviewCheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto, UpdateVendorOrderStatusDto } from './dto/update-order-status.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { GetOrdersPaginationDto } from './dto/get-order.dto';
import { randomBytes } from 'crypto';

/**
 * Hậu tố ngẫu nhiên 8 ký tự hex cho mã kiện/vận đơn (VO-/SHIP-yyyymm-XXXXXXXX).
 * Mã cũ chỉ có 4 chữ số (9000 giá trị/tháng) nên dễ trùng cột UNIQUE.
 */
const uniqueCodeSuffix = () => randomBytes(4).toString('hex').toUpperCase();

const orderInclude = {
  client: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
  details: {
    include: {
      productVariant: {
        include: {
          productColor: {
            include: {
              product: {
                include: {
                  vendor: { select: { id: true, fullName: true, storeName: true, avatarUrl: true } },
                },
              },
            },
          },
        },
      },
      review: true,
    },
  },
  payment: true,
  voucherDetails: {
    where: { productId: null },
    include: { voucher: true },
    orderBy: { sequence: 'asc' as const },
  },
  vendorOrders: {
    include: {
      vendor: {
        select: {
          id: true,
          fullName: true,
          storeName: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  },
  shipments: {
    include: {
      events: { orderBy: { createdAt: 'asc' as const } },
      carrier: { select: { id: true, fullName: true, employeeCode: true, phone: true, department: true } },
    },
  },
  statusHistory: {
    include: {
      admin: { select: { id: true, fullName: true, email: true } },
      employee: { select: { id: true, fullName: true, employeeCode: true, department: true } },
      vendor: { select: { id: true, storeName: true, fullName: true } },
      client: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

const surveyPromptSelect = {
  id: true,
  orderId: true,
  status: true,
  createdAt: true,
  survey: {
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      startDate: true,
      endDate: true,
      admin: { select: { id: true } },
      vendor: { select: { id: true } },
      questions: {
        orderBy: { position: 'asc' as const },
        select: {
          id: true,
          question: true,
          type: true,
          required: true,
          position: true,
          options: {
            orderBy: { position: 'asc' as const },
            select: { id: true, content: true, position: true }}}}}}} satisfies Prisma.SurveyResponseSelect;

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: [OrderStatus.confirmed, OrderStatus.cancelled],
  confirmed: [OrderStatus.processing, OrderStatus.cancelled],
  processing: [OrderStatus.shipping, OrderStatus.cancelled],
  shipping: [OrderStatus.completed, OrderStatus.cancelled],
  completed: [],
  cancelled: [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vouchersService: VouchersService,
    private readonly realtime: RealtimeService,
    private readonly surveysService: SurveysService,
  ) {}

  private async prepareCheckout(tx: Prisma.TransactionClient, clientId: string, dto: PreviewCheckoutDto) {
    const cart = await tx.cart.findUnique({ where: { clientId }, include: { items: { include: {
      productVariant: { include: { productColor: { include: { product: true } } } },
    } } } });
    if (!cart?.items.length) throw new BadRequestException('Giỏ hàng đang trống');
    let targetItems = cart.items;
    if (dto.cartItemIds?.length) {
      targetItems = cart.items.filter(item => dto.cartItemIds!.includes(item.id));
      if (new Set(dto.cartItemIds).size !== targetItems.length) throw new BadRequestException('Sản phẩm trong giỏ đã thay đổi, vui lòng chọn lại');
    } else if (dto.vendorId) {
      targetItems = cart.items.filter(item => item.productVariant.productColor.product.vendorId === dto.vendorId);
    }
    if (!targetItems.length) throw new BadRequestException('Không tìm thấy sản phẩm hợp lệ để đặt hàng');
    const vendorGroups = new Map<string, typeof targetItems>();
    for (const item of targetItems) {
      const vendorId = item.productVariant.productColor.product.vendorId || 'platform';
      vendorGroups.set(vendorId, [...(vendorGroups.get(vendorId) || []), item]);
    }
    if (dto.voucherSelections && dto.voucherCodes?.length) throw new BadRequestException('Vui lòng chọn mã theo từng cửa hàng');
    const codesByVendor = new Map<string, string[]>();
    for (const selection of dto.voucherSelections || []) {
      if (!vendorGroups.has(selection.vendorId) || codesByVendor.has(selection.vendorId)) throw new BadRequestException('Lựa chọn voucher không khớp cửa hàng trong giỏ');
      codesByVendor.set(selection.vendorId, selection.codes.map(code => code.trim().toUpperCase()));
    }
    const requestedCodes = dto.voucherSelections
      ? [...new Set([...codesByVendor.values()].flat())]
      : (dto.voucherCodes || []).map(code => code.trim().toUpperCase());
    if (!dto.voucherSelections && new Set(requestedCodes).size !== requestedCodes.length) throw new BadRequestException('Voucher bị trùng lặp');
    if (requestedCodes.length) {
      const vouchers = await tx.voucher.findMany({ where: { code: { in: requestedCodes }, deletedAt: null },
        select: { code: true, scope: true, vendorId: true } });
      if (vouchers.length !== requestedCodes.length) throw new BadRequestException('Voucher không tồn tại');
      for (const [vendorId] of vendorGroups) {
        const codes = dto.voucherSelections ? codesByVendor.get(vendorId) || [] : vouchers
          .filter(voucher => voucher.scope === VoucherScope.platform || voucher.vendorId === vendorId).map(voucher => voucher.code);
        if (codes.some(code => !vouchers.some(voucher => voucher.code === code &&
          (voucher.scope === VoucherScope.platform || voucher.vendorId === vendorId)))) throw new BadRequestException('Voucher không áp dụng cho cửa hàng được chọn');
        codesByVendor.set(vendorId, codes);
      }
      if (requestedCodes.some(code => ![...codesByVendor.values()].some(codes => codes.includes(code)))) throw new BadRequestException('Voucher không áp dụng cho các sản phẩm đã chọn');
    }
    return { targetItems, vendorGroups, codesByVendor };
  }

  async previewCheckout(clientId: string, dto: PreviewCheckoutDto) {
    return this.prisma.$transaction(async tx => {
      const { vendorGroups, codesByVendor } = await this.prepareCheckout(tx, clientId, dto);
      const plannedUses = new Map<string, number>();
      const packages: Array<{ vendorId: string; subtotalAmount: Prisma.Decimal; discountAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal; applications: unknown[] }> = [];
      for (const [vendorId, items] of vendorGroups) {
        const calculated = await this.vouchersService.calculate(codesByVendor.get(vendorId) || [], clientId,
          items.map(item => ({ productVariantId: item.productVariantId, quantity: item.quantity })), tx, plannedUses);
        packages.push({ vendorId, subtotalAmount: calculated.subtotalAmount, discountAmount: calculated.discountAmount,
          totalAmount: calculated.totalAmount, applications: calculated.applications });
      }
      return { packages, subtotalAmount: packages.reduce((sum, pack) => sum.plus(pack.subtotalAmount), new Prisma.Decimal(0)),
        discountAmount: packages.reduce((sum, pack) => sum.plus(pack.discountAmount), new Prisma.Decimal(0)),
        totalAmount: packages.reduce((sum, pack) => sum.plus(pack.totalAmount), new Prisma.Decimal(0)) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async checkout(clientId: string, dto: CheckoutDto) {
    let result: { orders: any[]; order: any; surveyNotifications: any[] } | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        result = await this.prisma.$transaction(
          async (tx) => {
          const { targetItems, vendorGroups, codesByVendor } = await this.prepareCheckout(tx, clientId, dto);

          const createdOrders: any[] = [];
          const allSurveyNotifications: any[] = [];
          const now = new Date();
          const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

          for (const [vId, vendorItems] of vendorGroups.entries()) {
            const calculated = await this.vouchersService.calculate(
              codesByVendor.get(vId) || [],
              clientId,
              vendorItems.map((item) => ({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
              })),
              tx,
            );

            // Create dedicated Order for this vendor
            const order = await tx.order.create({
              data: {
                clientId,
                subtotalAmount: calculated.subtotalAmount,
                discountAmount: calculated.discountAmount,
                shippingFee: 0,
                totalAmount: calculated.totalAmount,
                receiverName: dto.receiverName,
                receiverPhone: dto.receiverPhone,
                shippingAddress: dto.shippingAddress,
                notes: dto.notes,
              },
            });

            // Decrement variant stock & create OrderDetail records
            for (const item of calculated.items) {
              const changed = await tx.productVariant.updateMany({
                where: {
                  id: item.productVariantId,
                  deletedAt: null,
                  stock: { gte: item.quantity },
                },
                data: { stock: { decrement: item.quantity } },
              });
              if (!changed.count) {
                throw new ConflictException(
                  `Sản phẩm "${item.variant.productColor.product.name}" vừa thay đổi tồn kho, vui lòng thử lại`,
                );
              }

              await tx.orderDetail.create({
                data: {
                  orderId: order.id,
                  productVariantId: item.productVariantId,
                  quantity: item.quantity,
                  price: item.variant.price,
                  productName: item.variant.productColor.product.name,
                  colorName: item.variant.productColor.color,
                  sizeName: item.variant.size,
                  imageUrl: item.variant.productColor.imageUrls[0],
                },
              });
            }

            // Immediately create VendorOrder for this vendor
            let vOrder: any = null;
            if (vId !== 'platform') {
              const randomCode = uniqueCodeSuffix();
              vOrder = await tx.vendorOrder.create({
                data: {
                  orderId: order.id,
                  vendorId: vId,
                  vendorOrderCode: `VO-${yearMonth}-${randomCode}`,
                  subtotalAmount: calculated.subtotalAmount,
                  shippingFee: 0,
                  totalAmount: calculated.totalAmount,
                  status: VendorOrderStatus.pending,
                  notes: 'Kiện hàng đóng gói riêng cho gian hàng đối tác',
                },
              });

              await tx.orderDetail.updateMany({
                where: { orderId: order.id },
                data: { vendorOrderId: vOrder.id },
              });
            }

            // Apply vouchers if any
            for (const application of calculated.applications) {
              const reserved = await tx.voucher.updateMany({
                where: {
                  id: application.voucherId,
                  usedQuantity: application.expectedUsedQuantity,
                  quantity: { gt: application.expectedUsedQuantity },
                  status: 'active',
                },
                data: { usedQuantity: { increment: 1 } },
              });
              if (!reserved.count) {
                throw new ConflictException('Voucher vừa hết lượt sử dụng');
              }
              await tx.voucherDetail.create({
                data: {
                  voucherId: application.voucherId,
                  orderId: order.id,
                  eligibleAmount: application.eligibleAmount,
                  discountAmount: application.discountAmount,
                  sequence: application.sequence,
                },
              });
            }

            // Create Payment for this order
            await tx.payment.create({
              data: {
                orderId: order.id,
                method: dto.paymentMethod,
                amount: calculated.totalAmount,
              },
            });

            // Create OrderStatusHistory record
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                clientId: clientId,
                toStatus: OrderStatus.pending,
              },
            });

            // 1. Phân công cho Chuyên viên thuộc Bộ phận Điều phối & Liên kết Vendor tiếp nhận và kiểm duyệt
            const handlingEmp = await this.findBestHandlingEmployee(tx);
            // 2. Tự động phân công bưu tá thuộc Phòng Vận chuyển & Giao nhận
            let shipperEmp: { id: string; fullName: string; employeeCode: string; department: string } | null = null;
            try {
              shipperEmp = await this.findBestShipperEmployee(tx);
            } catch {
              // ignore
            }

            const tracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;

            // Kiện hàng khởi tạo và tự động phân công bưu tá Phòng Vận chuyển & Giao nhận
            const s = await tx.shipment.create({
              data: {
                trackingNumber: tracking,
                orderId: order.id,
                vendorOrderId: vOrder ? vOrder.id : undefined,
                carrierId: shipperEmp ? shipperEmp.id : null,
                carrierType: 'employee',
                status: shipperEmp ? ShipmentStatus.assigned : ShipmentStatus.pending,
                shippingAddress: order.shippingAddress,
                receiverName: order.receiverName,
                receiverPhone: order.receiverPhone,
                notes: shipperEmp
                  ? `Bưu tá tiếp nhận: ${shipperEmp.fullName} (${shipperEmp.employeeCode}) - Phòng Vận chuyển & Giao nhận`
                  : (handlingEmp
                      ? `Chuyên viên điều phối phụ trách: ${handlingEmp.fullName} (${handlingEmp.employeeCode}) - ${handlingEmp.department}.`
                      : 'Kiện hàng đang chờ tiếp nhận'),
              },
            });

            if (tx.shipmentEvent) {
              await tx.shipmentEvent.create({
                data: {
                  shipmentId: s.id,
                  status: shipperEmp ? ShipmentStatus.assigned : ShipmentStatus.pending,
                  location: 'Trung tâm điều phối MIVA Hub',
                  description: shipperEmp
                    ? `Đơn hàng mới tạo. Hệ thống tự động phân công bưu tá [${shipperEmp.fullName} / ${shipperEmp.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận kiện hàng`
                    : (handlingEmp
                        ? `Đơn hàng mới tạo. Hệ thống chuyển tới chuyên viên [${handlingEmp.fullName} / ${handlingEmp.employeeCode}] (Bộ phận Điều phối & Liên kết Vendor) tiếp nhận và kiểm duyệt`
                        : 'Đơn hàng mới tạo, chờ Bộ phận Điều phối & Liên kết Vendor tiếp nhận'),
                  actorRole: 'system',
                },
              });
            }

            if (handlingEmp) {
              await tx.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  employeeId: handlingEmp.id,
                  fromStatus: OrderStatus.pending,
                  toStatus: OrderStatus.pending,
                  note: `[Phân công tiếp nhận] Chuyên viên [${handlingEmp.fullName} / ${handlingEmp.employeeCode}] (${handlingEmp.department}) tiếp nhận đơn hàng để đối soát, xác nhận và chuyển giao cho Vendor`,
                },
              });
            }

            if (shipperEmp) {
              await tx.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  employeeId: shipperEmp.id,
                  fromStatus: OrderStatus.pending,
                  toStatus: OrderStatus.pending,
                  note: `[Tự động phân công] Bưu tá [${shipperEmp.fullName} / ${shipperEmp.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận đơn hàng`,
                },
              });
            }

            // Deliver survey notifications if applicable
            const surveyNotifications = await this.surveysService.deliverForOrder(
              tx,
              order.id,
              SurveyTriggerType.after_checkout,
            );
            allSurveyNotifications.push(...surveyNotifications);

            const createdOrder = await tx.order.findUniqueOrThrow({
              where: { id: order.id },
              include: orderInclude,
            });

            const surveyPrompts = await tx.surveyResponse.findMany({
              where: {
                orderId: order.id,
                clientId,
                status: SurveyResponseStatus.pending,
              },
              select: surveyPromptSelect,
              orderBy: { createdAt: 'asc' },
            });

            createdOrders.push({ ...createdOrder, surveyPrompts });
          }

          // Delete only the checked out cart items
          if (dto.expectedTotalAmount !== undefined) {
            const actualTotal = createdOrders.reduce((sum, order) => sum.plus(order.totalAmount), new Prisma.Decimal(0));
            if (!actualTotal.equals(dto.expectedTotalAmount)) throw new ConflictException('Giá hoặc voucher vừa thay đổi. Vui lòng kiểm tra tổng tiền và xác nhận lại.');
          }
          const checkedOutItemIds = targetItems.map((i) => i.id);
          await tx.cartItem.deleteMany({
            where: {
              id: { in: checkedOutItemIds },
            },
          });

          return {
            orders: createdOrders,
            order: createdOrders[0],
            surveyNotifications: allSurveyNotifications,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
        break;
      } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)));
            continue;
          }
          throw new ConflictException('Dữ liệu vừa thay đổi, vui lòng thực hiện checkout lại');
        }
        throw error;
      }
    }
    if (!result) throw new ConflictException('Dữ liệu vừa thay đổi, vui lòng thực hiện checkout lại');

    for (const o of result.orders) {
      this.emitOrder(o, 'order:created');
    }
    if (dto.voucherCodes?.length || dto.voucherSelections?.some(selection => selection.codes.length)) {
      this.realtime.emitToCatalog('voucher:updated', {});
    }
    this.surveysService.emitNotifications(result.surveyNotifications);

    return {
      ...result.order,
      orders: result.orders,
      orderIds: result.orders.map((o) => o.id),
      totalOrders: result.orders.length,
    };
  }

  listMine(clientId: string) {
    return this.prisma.order.findMany({
      where: { clientId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' }});
  }

  async listForVendor(vendorId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        details: {
          some: { productVariant: { productColor: { product: { vendorId } } } },
        },
      },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((o) => this.sanitizeOrderForVendor(o, vendorId));
  }

  async listVendorOrders(vendorId: string) {
    const list = await this.prisma.vendorOrder.findMany({
      where: { vendorId },
      include: {
        order: {
          select: {
            id: true,
            orderCode: true,
            status: true,
            createdAt: true,
            totalAmount: true,
            notes: true,
            payment: {
              select: {
                method: true,
                status: true,
              },
            },
            statusHistory: {
              include: {
                admin: { select: { fullName: true } },
                employee: { select: { fullName: true, employeeCode: true } },
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        details: {
          include: {
            productVariant: {
              include: {
                productColor: {
                  include: {
                    product: { select: { id: true, name: true, slug: true } },
                  },
                },
              },
            },
          },
        },
        shipment: {
          include: {
            carrier: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                employeeCode: true,
              },
            },
            events: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((vo) => ({
      ...vo,
      receiverName: 'Khách hàng MIVA (Bảo mật)',
      receiverPhone: '09******** (Bảo mật sàn)',
      shippingAddress:
        'Kho vận nội bộ MIVA điều phối - Bưu tá tiếp nhận tại kho shop',
      shipment: this.maskShipmentForVendor(vo.shipment),
    }));
  }

  async updateVendorOrderStatus(
    id: string,
    dto: UpdateVendorOrderStatusDto,
    user: UserInfo,
  ) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const vendorOrder = await this.prisma.vendorOrder.findFirst({
      where: {
        OR: [
          ...(isUUID ? [{ id }, { orderId: id }] : []),
          { vendorOrderCode: id },
        ],
        vendorId: user.userID,
      },
      include: {
        details: true,
        order: {
          include: {
            vendorOrders: true,
          },
        },
        shipment: true,
      },
    });

    if (!vendorOrder) {
      throw new NotFoundException('Không tìm thấy kiện hàng của shop');
    }

    const currentStatus = vendorOrder.status;
    const newStatus = dto.status;

    // Retried requests must not repeat shipment events or return stock twice.
    if (currentStatus === newStatus) {
      const { order: _order, details: _details, shipment: _shipment, ...unchanged } = vendorOrder;
      return { success: true, message: 'Trạng thái kiện hàng không thay đổi', vendorOrder: unchanged };
    }
    if (vendorOrder.order.status === OrderStatus.cancelled || vendorOrder.order.status === OrderStatus.completed) {
      throw new BadRequestException('Đơn hàng đã kết thúc, không thể cập nhật kiện hàng');
    }
    if (newStatus !== VendorOrderStatus.cancelled && vendorOrder.order.status === OrderStatus.pending) {
      throw new BadRequestException('Chờ Admin hoặc nhân viên MIVA xác nhận đơn hàng trước khi đóng gói');
    }
    if (newStatus === VendorOrderStatus.delivered) {
      throw new BadRequestException('Bưu tá hoặc Admin xác nhận giao thành công qua vận đơn');
    }
    if (newStatus === VendorOrderStatus.cancelled) {
      const order = await this.prisma.order.findUniqueOrThrow({ where: { id: vendorOrder.orderId }, include: orderInclude });
      if (order.vendorOrders.length !== 1) throw new BadRequestException('Đơn nhiều shop cũ cần Admin xử lý hủy toàn đơn');
      const cancelled = await this.updateStatus(order.id, { status: OrderStatus.cancelled, note: dto.note }, user);
      return { success: true, message: 'Đã hủy kiện và đồng bộ đơn, thanh toán, voucher, tồn kho',
        vendorOrder: cancelled.vendorOrders.find(parcel => parcel.id === vendorOrder.id) };
    }

    const vendorTransitions: Record<VendorOrderStatus, VendorOrderStatus[]> = {
      pending: [VendorOrderStatus.confirmed, VendorOrderStatus.cancelled],
      confirmed: [VendorOrderStatus.processing, VendorOrderStatus.cancelled],
      processing: [
        VendorOrderStatus.ready_for_pickup,
        VendorOrderStatus.shipping,
        VendorOrderStatus.cancelled,
      ],
      ready_for_pickup: [
        VendorOrderStatus.shipping,
        VendorOrderStatus.cancelled,
      ],
      shipping: [VendorOrderStatus.delivered],
      delivered: [],
      cancelled: [],
    };

    // Orders confirmed before this fix may still have a pending vendor parcel.
    const confirmedLegacyParcel = currentStatus === VendorOrderStatus.pending &&
      newStatus === VendorOrderStatus.processing &&
      vendorOrder.order.status !== OrderStatus.pending;
    if (!confirmedLegacyParcel && !vendorTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Không thể chuyển kiện hàng từ trạng thái "${currentStatus}" sang "${newStatus}"`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update VendorOrder status
      const vo = await tx.vendorOrder.update({
        where: { id: vendorOrder.id },
        data: {
          status: newStatus,
          notes: dto.note ? (vendorOrder.notes ? `${vendorOrder.notes} | ${dto.note}` : dto.note) : vendorOrder.notes,
          updatedAt: new Date(),
        },
      });

      // 2. Khi Vendor xác nhận và đóng gói (ready_for_pickup hoặc shipping):
      // Tự động chuyển tới nhân viên thuộc Phòng Vận chuyển & Giao nhận
      let mappedOrderStatus: OrderStatus = vendorOrder.order.status;
      const otherVendorOrders = (vendorOrder.order.vendorOrders || []).filter(
        (o) => o.id !== vendorOrder.id,
      );

      if (newStatus === VendorOrderStatus.shipping) {
        const allShipping = otherVendorOrders.every(
          (o) =>
            o.status === VendorOrderStatus.shipping ||
            o.status === VendorOrderStatus.delivered ||
            o.status === VendorOrderStatus.cancelled,
        );
        if (allShipping && vendorOrder.order.status !== OrderStatus.shipping) {
          mappedOrderStatus = OrderStatus.shipping;
          await tx.order.update({
            where: { id: vendorOrder.orderId },
            data: { status: OrderStatus.shipping },
          });
        }
      } else if (
        (newStatus === VendorOrderStatus.processing || newStatus === VendorOrderStatus.ready_for_pickup) &&
        vendorOrder.order.status === OrderStatus.confirmed
      ) {
        mappedOrderStatus = OrderStatus.processing;
        await tx.order.update({
          where: { id: vendorOrder.orderId },
          data: { status: OrderStatus.processing },
        });
      }

      let assignedShipper: { id: string; fullName: string; employeeCode: string; department: string } | null = null;
      if (
        (newStatus === VendorOrderStatus.ready_for_pickup || newStatus === VendorOrderStatus.shipping) &&
        vendorOrder.shipment
      ) {
        if (!vendorOrder.shipment.carrierId) {
          try {
            assignedShipper = await this.findBestShipperEmployee(tx);
          } catch {
            // ignore in mock environments
          }
        } else {
          const existingCarrier = await tx.employee.findUnique({
            where: { id: vendorOrder.shipment.carrierId },
            select: { id: true, fullName: true, employeeCode: true, department: true },
          });
          if (existingCarrier) assignedShipper = existingCarrier;
        }

        const nextShipStatus =
          newStatus === VendorOrderStatus.ready_for_pickup
            ? ShipmentStatus.picking_up
            : ShipmentStatus.in_transit;

        const effectiveCarrierId = vendorOrder.shipment.carrierId || (assignedShipper ? assignedShipper.id : null);

        await tx.shipment.update({
          where: { id: vendorOrder.shipment.id },
          data: {
            status: nextShipStatus,
            carrierId: effectiveCarrierId,
            carrierType: 'employee',
            notes: assignedShipper
              ? `Bưu tá tiếp nhận: ${assignedShipper.fullName} (${assignedShipper.employeeCode}) - Phòng Vận chuyển & Giao nhận`
              : vendorOrder.shipment.notes,
            updatedAt: new Date(),
          },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: vendorOrder.shipment.id,
            status: nextShipStatus,
            location: 'Kho hàng đối tác Vendor',
            description:
              dto.note ||
              (newStatus === VendorOrderStatus.ready_for_pickup
                ? (assignedShipper
                    ? `Shop đã đóng gói hoàn tất. Chuyển giao kiện hàng cho bưu tá [${assignedShipper.fullName} / ${assignedShipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) để tiếp nhận và đi giao.`
                    : 'Shop đã đóng gói hoàn tất. Kiện hàng sẵn sàng bàn giao cho bưu tá MIVA.')
                : 'Kiện hàng đã xuất kho và đang trong quá trình vận chuyển.'),
            actorRole: 'vendor',
            actorId: user.userID,
          },
        });

        if (assignedShipper) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: vendorOrder.orderId,
              employeeId: assignedShipper.id,
              fromStatus: vendorOrder.order.status,
              toStatus: mappedOrderStatus,
              note: `[Phân công giao nhận] Shop đóng gói hoàn tất, chuyển kiện hàng ${vendorOrder.vendorOrderCode} cho bưu tá [${assignedShipper.fullName} / ${assignedShipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận`,
            },
          });
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: vendorOrder.orderId,
          vendorId: user.userID,
          fromStatus: vendorOrder.order.status,
          toStatus: mappedOrderStatus,
          note: `[Kiện ${vendorOrder.vendorOrderCode}] ${dto.note || `Shop cập nhật trạng thái: ${newStatus}`}`,
        },
      });

      return { vo, assignedShipper };
    });

    const parentOrder = await this.prisma.order.findUnique({
      where: { id: vendorOrder.orderId }, include: orderInclude,
    });
    if (parentOrder) this.emitOrder(parentOrder, 'order:updated');

    if (updated.assignedShipper && vendorOrder.shipment) {
      const shipPayload = {
        shipmentId: vendorOrder.shipment.id,
        orderId: vendorOrder.orderId,
        trackingNumber: vendorOrder.shipment.trackingNumber,
        status: newStatus === VendorOrderStatus.ready_for_pickup ? ShipmentStatus.picking_up : ShipmentStatus.in_transit,
      };
      this.realtime.emitToUser(updated.assignedShipper.id, 'shipment:assigned', shipPayload);
      this.realtime.emitToEmployees('shipment:updated', shipPayload);
    }

    return {
      success: true,
      message: `Cập nhật trạng thái kiện hàng thành công (${newStatus})`,
      vendorOrder: updated.vo,
    };
  }

  async listAll(
    { page = 1, itemPerPage = 10, search, status }: GetOrdersPaginationDto,
    user?: UserInfo,
  ) {
    const baseWhere: Prisma.OrderWhereInput = {};

    // Nếu người dùng là nhân viên (employee), hiển thị đơn hàng theo đúng phân công và ban nghiệp vụ
    if (user?.role === 'employee') {
      const emp = await this.prisma.employee.findUnique({
        where: { id: user.userID },
        select: { id: true, department: true, assignedOrderScope: true },
      });

      if (emp) {
        const isManager = emp.assignedOrderScope === 'all_orders';
        const isVendorLink = emp.department.includes('Điều phối');
        const isShipping = emp.department.includes('Vận chuyển');
        const isExceptions = emp.department.includes('Sự cố');

        if (isManager) {
          if (isVendorLink) {
            baseWhere.OR = [
              { status: { in: [OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing] } },
              { statusHistory: { some: { employeeId: emp.id } } },
            ];
          } else if (isShipping) {
            baseWhere.OR = [
              { shipments: { some: {} } },
              { status: { in: [OrderStatus.processing, OrderStatus.shipping, OrderStatus.completed] } },
              { statusHistory: { some: { employeeId: emp.id } } },
            ];
          } else if (isExceptions) {
            baseWhere.OR = [
              { status: OrderStatus.cancelled },
              { shipments: { some: { status: { in: [ShipmentStatus.failed, ShipmentStatus.returned] } } } },
              { statusHistory: { some: { employeeId: emp.id } } },
            ];
          }
        } else {
          if (isShipping) {
            baseWhere.OR = [
              { shipments: { some: { carrierId: emp.id } } },
              { statusHistory: { some: { employeeId: emp.id } } },
            ];
          } else if (isVendorLink) {
            baseWhere.OR = [
              { statusHistory: { some: { employeeId: emp.id } } },
              { status: OrderStatus.pending },
            ];
          } else if (isExceptions) {
            baseWhere.OR = [
              { statusHistory: { some: { employeeId: emp.id } } },
              { shipments: { some: { status: { in: [ShipmentStatus.failed, ShipmentStatus.returned] } } } },
              { status: OrderStatus.cancelled },
            ];
          } else {
            baseWhere.statusHistory = { some: { employeeId: emp.id } };
          }
        }
      } else {
        baseWhere.shipments = {
          some: {
            carrierId: user.userID,
          },
        };
      }
    }

    // Tính toán tổng số lượng theo từng trạng thái trên toàn bộ database (theo phân quyền của nhân viên)
    const [
      countAll,
      countPending,
      countConfirmed,
      countProcessing,
      countShipping,
      countCompleted,
      countCancelled,
    ] = await Promise.all([
      this.prisma.order.count({ where: baseWhere }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.pending }] } }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.confirmed }] } }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.processing }] } }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.shipping }] } }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.completed }] } }),
      this.prisma.order.count({ where: { AND: [baseWhere, { status: OrderStatus.cancelled }] } }),
    ]);

    const countsByStatus = {
      all: countAll,
      pending: countPending,
      confirmed: countConfirmed,
      processing: countProcessing,
      shipping: countShipping,
      completed: countCompleted,
      cancelled: countCancelled,
    };

    const whereConditions: Prisma.OrderWhereInput[] = [baseWhere];

    if (status && status !== 'all') {
      whereConditions.push({ status: status as OrderStatus });
    }

    if (search && search.trim()) {
      const q = search.trim().replace(/^#/, '');
      whereConditions.push({
        OR: [
          { orderCode: { contains: q, mode: 'insensitive' } },
          { receiverName: { contains: q, mode: 'insensitive' } },
          { receiverPhone: { contains: q, mode: 'insensitive' } },
          {
            details: {
              some: {
                OR: [
                  { productName: { contains: q, mode: 'insensitive' } },
                  {
                    productVariant: {
                      productColor: {
                        product: {
                          name: { contains: q, mode: 'insensitive' },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      });
    }

    const where: Prisma.OrderWhereInput =
      whereConditions.length === 1 ? whereConditions[0] : { AND: whereConditions };

    const totalItems = await this.prisma.order.count({ where });
    const list = await this.prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * itemPerPage,
      take: itemPerPage,
    });

    // Tự động phân công nếu phát hiện đơn hàng chưa có nhân sự phụ trách đúng phòng ban
    let needsRefetch = false;
    for (const order of list) {
      const historyList = order.statusHistory || [];
      const hasHistoryEmp = historyList.some((h) => Boolean(h.employeeId));
      const hasCarrier = order.shipments?.some((s) => Boolean(s.carrierId));

      // 1. Luôn tự động phân công nhân viên giao hàng (Phòng Vận chuyển & Giao nhận) nếu chưa có
      if (!hasCarrier) {
        try {
          const shipper = await this.findBestShipperEmployee();
          if (shipper) {
            if (order.shipments && order.shipments.length > 0) {
              await this.prisma.shipment.updateMany({
                where: { orderId: order.id, carrierId: null },
                data: {
                  carrierId: shipper.id,
                  carrierType: 'employee',
                  status: ShipmentStatus.assigned,
                  notes: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao kiện`,
                  updatedAt: new Date(),
                },
              });
              for (const ship of order.shipments) {
                if (!ship.carrierId) {
                  await this.prisma.shipmentEvent.create({
                    data: {
                      shipmentId: ship.id,
                      status: ShipmentStatus.assigned,
                      location: 'Trung tâm phân phối MIVA Hub',
                      description: `Hệ thống tự động phân công bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận`,
                      actorRole: 'system',
                    },
                  });
                }
              }
            } else {
              const now = new Date();
              const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
              const tracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;
              const createdShipment = await this.prisma.shipment.create({
                data: {
                  trackingNumber: tracking,
                  orderId: order.id,
                  carrierId: shipper.id,
                  carrierType: 'employee',
                  status: ShipmentStatus.assigned,
                  shippingAddress: order.shippingAddress,
                  receiverName: order.receiverName,
                  receiverPhone: order.receiverPhone,
                  notes: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận`,
                },
              });
              await this.prisma.shipmentEvent.create({
                data: {
                  shipmentId: createdShipment.id,
                  status: ShipmentStatus.assigned,
                  location: 'Trung tâm phân phối MIVA Hub',
                  description: `Hệ thống tự động phân công bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận`,
                  actorRole: 'system',
                },
              });
            }

            await this.prisma.orderStatusHistory.create({
              data: {
                orderId: order.id,
                employeeId: shipper.id,
                fromStatus: order.status,
                toStatus: order.status,
                note: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận đơn`,
              },
            });
            needsRefetch = true;
          }
        } catch {
          // ignore
        }
      }

      // 2. Phân công Ban Xử lý Sự cố nếu đơn bị hủy
      if (order.status === OrderStatus.cancelled) {
        const hasException = historyList.some(
          (h) =>
            h.employee?.department?.toLowerCase().includes('sự cố') ||
            h.note?.toLowerCase().includes('sự cố'),
        );
        if (!hasException) {
          try {
            const expEmp = await this.findBestExceptionEmployee();
            if (expEmp) {
              await this.prisma.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  employeeId: expEmp.id,
                  fromStatus: OrderStatus.cancelled,
                  toStatus: OrderStatus.cancelled,
                  note: `[Tự động phân công] Hệ thống phân công chuyên viên [${expEmp.fullName} / ${expEmp.employeeCode}] (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) giải quyết hồ sơ đơn hủy`,
                },
              });
              needsRefetch = true;
            }
          } catch {
            // ignore
          }
        }
      } else {
        // 3. pending, confirmed, processing -> Ban Điều phối & Liên kết Vendor
        const hasHandling = historyList.some(
          (h) =>
            h.employee?.department?.toLowerCase().includes('điều phối') ||
            h.employee?.department?.toLowerCase().includes('vendor') ||
            h.note?.toLowerCase().includes('điều phối'),
        );
        if (!hasHandling) {
          try {
            const handlingEmp = await this.findBestHandlingEmployee();
            if (handlingEmp) {
              await this.prisma.orderStatusHistory.create({
                data: {
                  orderId: order.id,
                  employeeId: handlingEmp.id,
                  fromStatus: order.status,
                  toStatus: order.status,
                  note: `[Tự động phân công] Chuyên viên [${handlingEmp.fullName} / ${handlingEmp.employeeCode}] (Bộ phận Điều phối & Liên kết Vendor) tiếp nhận và xử lý đơn`,
                },
              });
              needsRefetch = true;
            }
          } catch {
            // ignore
          }
        }
      }

      if (!hasHistoryEmp && !hasCarrier && !needsRefetch) {
        try {
          await this.autoAssignOrder(order.id, { role: 'admin', userID: 'system-auto' } as any);
          needsRefetch = true;
        } catch {
          // ignore
        }
      }
    }

    const finalList = needsRefetch
      ? await this.prisma.order.findMany({
          where,
          include: orderInclude,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * itemPerPage,
          take: itemPerPage,
        })
      : list;

    return {
      list: finalList,
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      countsByStatus,
    };
  }

  async getById(id: string, user: UserInfo) {
    let order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Tự động phân công bưu tá nếu chưa có
    if (!order.shipments?.some((s) => Boolean(s.carrierId))) {
      try {
        const shipper = await this.findBestShipperEmployee();
        if (shipper) {
          if (order.shipments && order.shipments.length > 0) {
            await this.prisma.shipment.updateMany({
              where: { orderId: order.id, carrierId: null },
              data: {
                carrierId: shipper.id,
                carrierType: 'employee',
                status: ShipmentStatus.assigned,
                notes: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao kiện`,
                updatedAt: new Date(),
              },
            });
          } else {
            const now = new Date();
            const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
            const tracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;
            await this.prisma.shipment.create({
              data: {
                trackingNumber: tracking,
                orderId: order.id,
                carrierId: shipper.id,
                carrierType: 'employee',
                status: ShipmentStatus.assigned,
                shippingAddress: order.shippingAddress,
                receiverName: order.receiverName,
                receiverPhone: order.receiverPhone,
                notes: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận`,
              },
            });
          }

          await this.prisma.orderStatusHistory.create({
            data: {
              orderId: order.id,
              employeeId: shipper.id,
              fromStatus: order.status,
              toStatus: order.status,
              note: `[Tự động phân công] Bưu tá [${shipper.fullName} / ${shipper.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận đơn`,
            },
          });

          order = await this.prisma.order.findUniqueOrThrow({
            where: { id },
            include: orderInclude,
          });
        }
      } catch {
        // ignore
      }
    }

    await this.assertCanView(order, user);
    if (user.role === 'vendor') {
      return this.sanitizeOrderForVendor(order, user.userID);
    }
    return order;
  }

  /** Ẩn thông tin người nhận trong vận đơn khi trả cho vendor (bảo mật sàn MIVA). */
  private maskShipmentForVendor<T extends Record<string, any> | null | undefined>(
    shipment: T,
  ): T {
    if (!shipment) return shipment;
    return {
      ...shipment,
      receiverName: 'Khách hàng MIVA (Bảo mật)',
      receiverPhone: '09******** (Bảo mật sàn MIVA)',
      shippingAddress: 'Địa chỉ người nhận được bảo mật bởi sàn MIVA',
    };
  }

  private sanitizeOrderForVendor(order: any, vendorId: string) {
    const vendorDetails = (order.details || []).filter(
      (d: any) =>
        d.productVariant?.productColor?.product?.vendorId === vendorId,
    );
    const vendorSubtotal = vendorDetails.reduce(
      (sum: number, d: any) => sum + Number(d.price) * d.quantity,
      0,
    );
    const myVendorOrder = (order.vendorOrders || []).find(
      (vo: any) => vo.vendorId === vendorId,
    );
    const shipments = Array.isArray(order.shipments)
      ? order.shipments
          .filter(
            (s: any) =>
              !s.vendorOrderId || !myVendorOrder || s.vendorOrderId === myVendorOrder.id,
          )
          .map((s: any) => this.maskShipmentForVendor(s))
      : order.shipments;

    return {
      ...order,
      receiverName: 'Khách hàng MIVA (Bảo mật)',
      receiverPhone: '09******** (Bảo mật sàn MIVA)',
      shippingAddress:
        'Địa chỉ người nhận được bảo mật bởi sàn MIVA - Đơn vị vận chuyển nội bộ MIVA tiếp nhận tại kho Vendor',
      client: {
        id: order.clientId,
        fullName: 'Khách hàng MIVA',
      },
      details: vendorDetails,
      subtotalAmount: vendorSubtotal,
      totalAmount: vendorSubtotal,
      ...(order.vendorOrders !== undefined && {
        vendorOrders: myVendorOrder ? [myVendorOrder] : [],
      }),
      ...(shipments !== undefined && { shipments }),
      vendorOrder: myVendorOrder || null,
    };
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, user: UserInfo) {
    const current = await this.getById(id, user);

    if (user.role === 'employee') {
      const isAssigned =
        (current.shipments || []).some((s: any) => s.carrierId === user.userID) ||
        (current.statusHistory || []).some((h: any) => h.employeeId === user.userID);
      if (!isAssigned) {
        throw new ForbiddenException(
          'Bạn không có quyền thao tác trên đơn hàng được phân công cho nhân viên khác',
        );
      }
    }

    if (user.role === 'vendor') {
      const parcels = await this.prisma.vendorOrder.findMany({ where: { orderId: id }, select: { vendorId: true } });
      if (dto.status !== OrderStatus.cancelled || parcels.length !== 1 || parcels[0].vendorId !== user.userID) {
        throw new ForbiddenException(
          'Vendor xử lý đóng gói và bàn giao qua kiện hàng của shop',
        );
      }
    }
    if (user.role === 'client') {
      if (
        dto.status !== OrderStatus.cancelled ||
        current.status !== OrderStatus.pending
      ) {
        throw new ForbiddenException(
          'Khách hàng chỉ được hủy đơn đang chờ xác nhận',
        );
      }
    }

    if (user.role === 'employee') {
      const emp = await this.prisma.employee.findUnique({
        where: { id: user.userID },
        select: { department: true, permissions: true },
      });
      const perms = (emp?.permissions as any) || {};

      if (dto.status === OrderStatus.confirmed) {
        const canConfirm =
          emp?.department?.includes('Điều phối') ||
          perms.orders?.canConfirmOrder ||
          perms.orders?.canTransferToVendor;
        if (!canConfirm) {
          throw new ForbiddenException(
            'Chỉ nhân viên thuộc Bộ phận Điều phối & Liên kết Vendor mới có quyền xác nhận và chuyển đơn cho Vendor',
          );
        }
      } else if (dto.status === OrderStatus.cancelled) {
        const canCancel =
          emp?.department?.includes('Sự cố') ||
          perms.orders?.canHandleExceptions ||
          perms.orders?.canRejectUnconfirmed;
        if (!canCancel) {
          throw new ForbiddenException(
            'Chỉ nhân viên thuộc Bộ phận Xử lý Sự cố & Ngoại lệ Đơn mới có quyền xử lý ngoại lệ hoặc hủy đơn hàng',
          );
        }
      }
    }

    if (dto.status !== current.status && !transitions[current.status].includes(dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ ${current.status} sang ${dto.status}`,
      );
    }
    if (dto.status === current.status && (current.status === OrderStatus.cancelled || current.status === OrderStatus.completed)) return current;
    if (dto.status === OrderStatus.cancelled && current.shipments.some(shipment => shipment.status === ShipmentStatus.delivered)) {
      throw new BadRequestException('Đơn có kiện đã giao thành công cần xử lý hoàn trả, không thể hủy trực tiếp');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({
        where: { id, status: current.status },
        data: { status: dto.status, cancelledAt: dto.status === OrderStatus.cancelled ? new Date() : undefined },
      });
      if (!claimed.count) throw new ConflictException('Đơn hàng vừa được cập nhật. Vui lòng tải lại và thử lại');
      if (dto.status === OrderStatus.cancelled) {
        const cancelledParcels = new Set(current.vendorOrders.filter(parcel => parcel.status === VendorOrderStatus.cancelled).map(parcel => parcel.id));
        for (const detail of current.details.filter(detail => !detail.vendorOrderId || !cancelledParcels.has(detail.vendorOrderId))) {
          await tx.productVariant.update({
            where: { id: detail.productVariantId },
            data: { stock: { increment: detail.quantity } }});
        }
        const usages = current.voucherDetails.filter(
          (detail) => !detail.reversedAt,
        );
        for (const usage of usages) {
          await tx.voucherDetail.update({
            where: { id: usage.id },
            data: { reversedAt: new Date() }});
          await tx.voucher.updateMany({
            where: { id: usage.voucherId, usedQuantity: { gt: 0 } },
            data: { usedQuantity: { decrement: 1 } }});
        }
        await tx.payment.update({
          where: { orderId: id },
          data: {
            status:
              current.payment?.status === PaymentStatus.paid
                ? PaymentStatus.refunded
                : PaymentStatus.cancelled}});

        await tx.vendorOrder.updateMany({
          where: { orderId: id, status: { not: 'delivered' } },
          data: { status: 'cancelled' },
        });

        await tx.shipment.updateMany({
          where: { orderId: id, status: { not: ShipmentStatus.delivered } },
          data: {
            status: ShipmentStatus.returned,
            failedReason: dto.note || 'Đơn hàng bị hủy, hoàn hàng về kho',
            notes: dto.note ? `Hủy đơn: ${dto.note}` : 'Đơn hàng bị hủy, hoàn hàng về kho',
          },
        });
        if (current.shipments.length) await tx.shipmentEvent.createMany({ data: current.shipments.filter(shipment =>
          ![ShipmentStatus.returned, ShipmentStatus.delivered].includes(shipment.status as any)).map(shipment => ({
          shipmentId: shipment.id, status: ShipmentStatus.returned, actorRole: user.role, actorId: user.userID,
          description: dto.note || 'Đơn hàng bị hủy, hoàn hàng về kho',
        })) });
      }
      if (
        dto.status === OrderStatus.completed &&
        current.payment?.method === PaymentMethod.cod &&
        current.payment.status === PaymentStatus.pending
      ) {
        await tx.payment.update({
          where: { orderId: id },
          data: { status: PaymentStatus.paid, paidAt: new Date() }});
      }
      if (dto.status === OrderStatus.shipping || dto.status === OrderStatus.completed) {
        await tx.vendorOrder.updateMany({ where: { orderId: id, status: { not: VendorOrderStatus.cancelled } },
          data: { status: dto.status === OrderStatus.completed ? VendorOrderStatus.delivered : VendorOrderStatus.shipping } });
        await tx.shipment.updateMany({ where: { orderId: id, status: { notIn: [ShipmentStatus.returned, ShipmentStatus.delivered] } },
          data: { status: dto.status === OrderStatus.completed ? ShipmentStatus.delivered : ShipmentStatus.in_transit,
            deliveredAt: dto.status === OrderStatus.completed ? new Date() : undefined } });
        const shipmentStatus = dto.status === OrderStatus.completed ? ShipmentStatus.delivered : ShipmentStatus.in_transit;
        if (current.shipments.length) await tx.shipmentEvent.createMany({ data: current.shipments.filter(shipment =>
          shipment.status !== ShipmentStatus.returned && shipment.status !== ShipmentStatus.delivered && shipment.status !== shipmentStatus).map(shipment => ({
          shipmentId: shipment.id, status: shipmentStatus, actorRole: user.role, actorId: user.userID,
          description: dto.note || 'Cập nhật vận đơn theo trạng thái đơn hàng',
        })) });
      }
      if (dto.status === OrderStatus.confirmed || dto.status === OrderStatus.processing) {
        // Multi-Vendor Order Splitting into VendorOrder
        const vendorGroups = new Map<string, typeof current.details>();
        for (const detail of current.details) {
          const vId = detail.productVariant?.productColor?.product?.vendorId;
          if (vId) {
            if (!vendorGroups.has(vId)) {
              vendorGroups.set(vId, []);
            }
            vendorGroups.get(vId)!.push(detail);
          }
        }

        const now = new Date();
        const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

        for (const [vId, vendorDetails] of vendorGroups.entries()) {
          let vOrder = await tx.vendorOrder.findFirst({
            where: { orderId: id, vendorId: vId },
          });

          const subtotal = vendorDetails.reduce(
            (sum, d) => sum + Number(d.price) * d.quantity,
            0,
          );

          if (!vOrder) {
            const randomCode = uniqueCodeSuffix();
            vOrder = await tx.vendorOrder.create({
              data: {
                orderId: id,
                vendorId: vId,
                vendorOrderCode: `VO-${yearMonth}-${randomCode}`,
                subtotalAmount: subtotal,
                shippingFee: 0,
                totalAmount: subtotal,
                status: 'pending',
                notes: 'Kiện hàng điều phối từ nhân viên MIVA - Chờ Shop xác nhận',
              },
            });
          } else if (vOrder.status === 'pending') {
            vOrder = await tx.vendorOrder.update({
              where: { id: vOrder.id },
              data: { status: 'confirmed' },
            });
          }

          for (const d of vendorDetails) {
            await tx.orderDetail.update({
              where: { id: d.id },
              data: { vendorOrderId: vOrder.id },
            });
          }

          const existingShipment = await tx.shipment.findFirst({
            where: { vendorOrderId: vOrder.id },
          });

          if (!existingShipment) {
            const shipTracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;
            const shipment = await tx.shipment.create({
              data: {
                trackingNumber: shipTracking,
                orderId: id,
                vendorOrderId: vOrder.id,
                carrierId: null,
                carrierType: 'employee',
                status: ShipmentStatus.pending,
                shippingAddress: current.shippingAddress,
                receiverName: current.receiverName,
                receiverPhone: current.receiverPhone,
                notes: 'Kiện hàng đã được điều phối chuyển cho Vendor. Chờ Shop đóng gói hoàn tất để điều phối bưu tá vận chuyển.',
              },
            });

            await tx.shipmentEvent.create({
              data: {
                shipmentId: shipment.id,
                status: ShipmentStatus.pending,
                location: 'Trung tâm phân phối MIVA Hub',
                description: 'Đơn hàng được xác nhận và khởi tạo vận đơn. Chờ đối tác Vendor đóng gói hoàn tất để điều phối bưu tá.',
                actorRole: user.role,
                actorId: user.userID,
              },
            });
          }
        }
      }

      const actorData: {
        adminId?: string;
        vendorId?: string;
        clientId?: string;
        employeeId?: string;
      } = {};
      let auditNote = dto.note;
      if (user.role === 'admin') {
        actorData.adminId = user.userID;
      } else if (user.role === 'vendor') {
        actorData.vendorId = user.userID;
      } else if (user.role === 'client') {
        actorData.clientId = user.userID;
      } else if (user.role === 'employee') {
        actorData.employeeId = user.userID;
        auditNote = auditNote ? `[Nhân viên] ${auditNote}` : '[Nhân viên xử lý]';

        // Tạo thông báo thực tế cho Vendor và Admin khi nhân viên xử lý / báo cáo sự cố
        const employee = await tx.employee.findUnique({
          where: { id: user.userID },
          select: { id: true, fullName: true, employeeCode: true },
        });
        const empName = employee
          ? `${employee.fullName} (${employee.employeeCode || 'NV'})`
          : 'Nhân viên điều phối';
        const orderCodeStr = current.orderCode || current.id.slice(0, 8).toUpperCase();

        const rawNote = dto.note || '';
        const noteLower = rawNote.toLowerCase();

        const shouldNotifyAdmin =
          dto.notifyTarget === 'admin' ||
          dto.notifyTarget === 'both' ||
          (!dto.notifyTarget &&
            (noteLower.includes('admin') ||
              noteLower.includes('chuyển tiếp') ||
              noteLower.includes('phê duyệt') ||
              noteLower.includes('báo cáo sự cố')));

        const shouldNotifyVendor =
          dto.notifyTarget === 'vendor' ||
          dto.notifyTarget === 'both' ||
          (!dto.notifyTarget &&
            (noteLower.includes('vendor') ||
              noteLower.includes('kho') ||
              noteLower.includes('đốc thúc') ||
              noteLower.includes('xử lý sự cố') ||
              noteLower.includes('sla')));

        if (shouldNotifyAdmin) {
          const admins = await tx.admin.findMany({
            where: { status: 'active', deletedAt: null },
            select: { id: true },
          });
          const adminTitle = dto.title || `[Báo cáo sự cố] Đơn hàng #${orderCodeStr}`;
          for (const adm of admins) {
            await tx.notification.create({
              data: {
                adminId: adm.id,
                type: 'order_update',
                title: adminTitle,
                content: `Nhân viên ${empName} đã lập báo cáo sự cố / chuyển tiếp: ${rawNote}`,
                data: {
                  orderId: id,
                  orderCode: orderCodeStr,
                  employeeId: user.userID,
                  employeeName: empName,
                  type: 'employee_incident_report',
                },
              },
            });
          }
        }

        if (shouldNotifyVendor) {
          const vendorIds: string[] = Array.from(
            new Set(
              current.details
                .map((d: any) => d.productVariant?.productColor?.product?.vendorId)
                .filter((id: any): id is string => Boolean(id)),
            ),
          );
          const vendorTitle = dto.title || `[Thông báo sự cố đơn hàng] #${orderCodeStr}`;
          for (const vId of vendorIds) {
            await tx.notification.create({
              data: {
                vendorId: vId,
                type: 'order_update',
                title: vendorTitle,
                content: `Nhân viên điều phối ${empName} gửi thông báo xử lý đơn hàng: ${rawNote}`,
                data: {
                  orderId: id,
                  orderCode: orderCodeStr,
                  employeeId: user.userID,
                  employeeName: empName,
                  type: 'employee_incident_action',
                },
              },
            });
          }
        }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          ...actorData,
          fromStatus: current.status,
          toStatus: dto.status,
          note: auditNote,
        },
      });

      // Tự động chuyển tới Bộ phận Xử lý Sự cố & Ngoại lệ Đơn nếu đơn hàng phát sinh sự cố, hủy đơn hoặc khiếu nại
      let assignedExceptionEmp: { id: string; fullName: string; employeeCode: string; department: string } | null = null;
      const rawNote = dto.note || '';
      const noteLower = rawNote.toLowerCase();
      const isIncident =
        dto.status === OrderStatus.cancelled ||
        noteLower.includes('sự cố') ||
        noteLower.includes('khiếu nại') ||
        noteLower.includes('bom hàng') ||
        noteLower.includes('hỏng') ||
        noteLower.includes('lỗi') ||
        noteLower.includes('ngoại lệ') ||
        noteLower.includes('chuyển tiếp') ||
        noteLower.includes('báo cáo sự cố') ||
        dto.notifyTarget === 'admin';

      if (isIncident) {
        try {
          assignedExceptionEmp = await this.findBestExceptionEmployee(tx);
        } catch {
          // ignore in mock environments
        }
        if (assignedExceptionEmp) {
          await tx.orderStatusHistory.create({
            data: {
              orderId: id,
              employeeId: assignedExceptionEmp.id,
              fromStatus: current.status,
              toStatus: dto.status,
              note: `[Chuyển Ban Xử lý Sự cố] Hồ sơ sự cố đơn hàng được chuyển giao cho chuyên viên [${assignedExceptionEmp.fullName} / ${assignedExceptionEmp.employeeCode}] (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) tiếp nhận và giải quyết`,
            },
          });
        }
      }

      const updated = await tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
      const surveyNotifications =
        dto.status === OrderStatus.completed
          ? await this.surveysService.deliverForOrder(
              tx,
              id,
              SurveyTriggerType.after_order_completed,
            )
          : [];
      return { updated, surveyNotifications, assignedExceptionEmp, auditNote };
    });

    this.emitOrder(result.updated, 'order:updated');
    this.surveysService.emitNotifications(result.surveyNotifications);
    if (result.assignedExceptionEmp) {
      this.realtime.emitToUser(result.assignedExceptionEmp.id, 'order:exception', {
        orderId: id,
        orderCode: result.updated.orderCode,
        note: result.auditNote,
      });
      this.realtime.emitToEmployees('order:exception', {
        orderId: id,
        orderCode: result.updated.orderCode,
      });
    }
    return result.updated;
  }

  /**
   * Tìm nhân viên tiếp nhận & chuyển đơn thuộc Bộ phận Điều phối & Liên kết Vendor
   */
  async findBestHandlingEmployee(tx?: Prisma.TransactionClient, excludeEmployeeId?: string) {
    const client = tx || this.prisma;
    const candidates = await client.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        department: { contains: 'Điều phối', mode: 'insensitive' },
        ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
      },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        department: true,
        phone: true,
      },
    });

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Tìm nhân viên xử lý sự cố & ngoại lệ thuộc Bộ phận Xử lý Sự cố & Ngoại lệ Đơn
   */
  async findBestExceptionEmployee(tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;
    const candidates = await client.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        department: { contains: 'Sự cố', mode: 'insensitive' },
      },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        department: true,
        phone: true,
      },
    });

    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Tìm nhân viên bưu tá giao hàng thuộc Phòng Vận chuyển & Giao nhận
   * Tuyệt đối không trùng với nhân viên tiếp nhận đơn
   */
  async findBestShipperEmployee(tx?: Prisma.TransactionClient, excludeEmployeeId?: string) {
    const client = tx || this.prisma;
    const candidates = await client.employee.findMany({
      where: {
        status: 'active',
        deletedAt: null,
        OR: [
          { department: { contains: 'Vận chuyển', mode: 'insensitive' } },
          { department: { contains: 'Giao nhận', mode: 'insensitive' } },
        ],
        ...(excludeEmployeeId ? { id: { not: excludeEmployeeId } } : {}),
      },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        department: true,
        phone: true,
        assignedShipments: {
          where: {
            status: {
              in: [
                ShipmentStatus.assigned,
                ShipmentStatus.picking_up,
                ShipmentStatus.in_transit,
                ShipmentStatus.out_for_delivery,
              ],
            },
          },
          select: { id: true },
        },
      },
    });

    if (!candidates.length) return null;
    const sorted = [...candidates].sort(
      (a, b) => (a.assignedShipments?.length || 0) - (b.assignedShipments?.length || 0),
    );
    const minLoad = sorted[0].assignedShipments?.length || 0;
    const leastBusy = sorted.filter(
      (c) => (c.assignedShipments?.length || 0) === minLoad,
    );
    return leastBusy[Math.floor(Math.random() * leastBusy.length)];
  }

  async findBestAvailableEmployee(tx?: Prisma.TransactionClient, excludeEmployeeId?: string) {
    return this.findBestShipperEmployee(tx, excludeEmployeeId);
  }

  async assignOrder(id: string, dto: AssignOrderDto, user: UserInfo) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shipments: true, vendorOrders: true },
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    if (order.status === OrderStatus.completed || order.status === OrderStatus.cancelled) {
      throw new BadRequestException('Không thể phân công đơn hàng đã kết thúc');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        phone: true,
        department: true,
        status: true,
        deletedAt: true,
      },
    });
    if (!employee) {
      throw new NotFoundException('Không tìm thấy nhân viên được chỉ định');
    }
    if (employee.status !== 'active' || employee.deletedAt) {
      throw new BadRequestException('Nhân viên được chỉ định không còn hoạt động');
    }

    const dept = (employee.department || '').toLowerCase();
    const isShipper = dept.includes('vận chuyển') || dept.includes('giao nhận');
    const isHandling = dept.includes('điều phối') || dept.includes('vendor');
    const isException = dept.includes('sự cố') || dept.includes('ngoại lệ');

    const updated = await this.prisma.$transaction(async (tx) => {
      let historyNote = '';

      if (isShipper) {
        let shipments = await tx.shipment.findMany({ where: { orderId: id } });

        if (!shipments.length) {
          const now = new Date();
          const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
          const tracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;

          const s = await tx.shipment.create({
            data: {
              trackingNumber: tracking,
              orderId: id,
              carrierId: employee.id,
              carrierType: 'employee',
              status: ShipmentStatus.assigned,
              shippingAddress: order.shippingAddress,
              receiverName: order.receiverName,
              receiverPhone: order.receiverPhone,
              notes:
                dto.note ||
                `Admin chỉ định bưu tá ${employee.fullName} (${employee.employeeCode})`,
            },
          });

          await tx.shipmentEvent.create({
            data: {
              shipmentId: s.id,
              status: ShipmentStatus.assigned,
              location: 'Trung tâm điều phối MIVA Hub',
              description: `Admin chỉ định bưu tá giao nhận ${employee.fullName} (${employee.employeeCode})${dto.note ? `: ${dto.note}` : ''}`,
              actorRole: user.role,
              actorId: user.userID,
            },
          });
        } else {
          for (const s of shipments) {
            await tx.shipment.update({
              where: { id: s.id },
              data: {
                carrierId: employee.id,
                carrierType: 'employee',
                status:
                  s.status === ShipmentStatus.pending
                    ? ShipmentStatus.assigned
                    : s.status,
                notes: dto.note
                  ? `${s.notes ? s.notes + '\n' : ''}${dto.note}`
                  : s.notes,
              },
            });

            await tx.shipmentEvent.create({
              data: {
                shipmentId: s.id,
                status:
                  s.status === ShipmentStatus.pending
                    ? ShipmentStatus.assigned
                    : s.status,
                location: 'Trung tâm điều phối MIVA Hub',
                description: `Admin chỉ định bưu tá giao nhận ${employee.fullName} (${employee.employeeCode})${dto.note ? `: ${dto.note}` : ''}`,
                actorRole: user.role,
                actorId: user.userID,
              },
            });
          }
        }

        historyNote = `[Chỉ định Bưu tá] Admin đã phân công bưu tá [${employee.fullName} / ${employee.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách vận chuyển giao nhận${dto.note ? `. Ghi chú: ${dto.note}` : ''}`;
      } else if (isHandling) {
        historyNote = `[Chỉ định Điều phối] Admin đã phân công nhân viên [${employee.fullName} / ${employee.employeeCode}] (Bộ phận Điều phối & Liên kết Vendor) phụ trách tiếp nhận & liên kết Vendor${dto.note ? `. Ghi chú: ${dto.note}` : ''}`;
      } else if (isException) {
        historyNote = `[Chỉ định Xử lý Sự cố] Admin đã phân công chuyên viên [${employee.fullName} / ${employee.employeeCode}] (Bộ phận Xử lý Sự cố & Ngoại lệ Đơn) tiếp nhận & xử lý sự cố${dto.note ? `. Ghi chú: ${dto.note}` : ''}`;
      } else {
        historyNote = `[Điều phối Admin] Đã phân công đơn hàng cho nhân viên [${employee.fullName} / ${employee.employeeCode}] (${employee.department || 'Bộ phận Vận hành'})${dto.note ? `. Ghi chú: ${dto.note}` : ''}`;
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          ...(user.role === 'admin' ? { adminId: user.userID } : {}),
          employeeId: employee.id,
          fromStatus: order.status,
          toStatus: order.status,
          note: historyNote,
        },
      });

      return tx.order.findUniqueOrThrow({
        where: { id },
        include: orderInclude,
      });
    });

    this.emitOrder(updated, 'order:updated');

    if (isShipper) {
      const firstShipment = updated.shipments?.[0];
      this.realtime.emitToUser(employee.id, 'shipment:assigned', {
        shipmentId: firstShipment?.id,
        orderId: updated.id,
        orderCode: updated.orderCode,
        trackingNumber: firstShipment?.trackingNumber,
      });
    } else if (isHandling) {
      this.realtime.emitToUser(employee.id, 'order:assigned', {
        orderId: updated.id,
        orderCode: updated.orderCode,
      });
    } else if (isException) {
      this.realtime.emitToUser(employee.id, 'order:exception', {
        orderId: updated.id,
        orderCode: updated.orderCode,
        reason: dto.note || 'Admin chỉ định xử lý sự cố',
      });
    }

    return updated;
  }

  async autoAssignOrder(
    id: string,
    user: UserInfo,
    departmentType?: 'handling' | 'shipping' | 'exception',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { shipments: true },
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    let targetDept = departmentType;
    if (!targetDept) {
      const hasFailedShipment = order.shipments?.some(
        (s) =>
          s.status === ShipmentStatus.failed ||
          s.status === ShipmentStatus.returned,
      );
      const hasCarrier = order.shipments?.some((s) => Boolean(s.carrierId));
      if (order.status === OrderStatus.cancelled || hasFailedShipment) {
        targetDept = 'exception';
      } else if (!hasCarrier || order.status === OrderStatus.shipping) {
        targetDept = 'shipping';
      } else {
        targetDept = 'handling';
      }
    }

    let candidate: {
      id: string;
      fullName: string;
      employeeCode: string;
      department: string;
    } | null = null;
    let deptTitle = '';

    if (targetDept === 'exception') {
      candidate = await this.findBestExceptionEmployee();
      deptTitle = 'Bộ phận Xử lý Sự cố & Ngoại lệ Đơn';
    } else if (targetDept === 'shipping') {
      candidate = await this.findBestShipperEmployee();
      deptTitle = 'Phòng Vận chuyển & Giao nhận';
    } else {
      candidate = await this.findBestHandlingEmployee();
      deptTitle = 'Bộ phận Điều phối & Liên kết Vendor';
    }

    if (!candidate) {
      throw new BadRequestException(
        `Không tìm thấy nhân viên đang hoạt động thuộc ${deptTitle}`,
      );
    }

    const note = `Hệ thống tự động phân công ngẫu nhiên nhân sự thuộc ${deptTitle}: ${candidate.fullName} (${candidate.employeeCode})`;
    return this.assignOrder(id, { employeeId: candidate.id, note }, user);
  }

  async autoAssignAll(user: UserInfo) {
    // 1. Find all shipments without carrier assigned
    const unassignedShipments = await this.prisma.shipment.findMany({
      where: {
        carrierId: null,
        order: {
          status: { notIn: [OrderStatus.completed, OrderStatus.cancelled] },
        },
      },
      include: { order: true },
    });

    let count = 0;
    for (const shipment of unassignedShipments) {
      const bestEmp = await this.findBestShipperEmployee();
      if (!bestEmp) break;

      await this.prisma.$transaction(async (tx) => {
        await tx.shipment.update({
          where: { id: shipment.id },
          data: {
            carrierId: bestEmp.id,
            carrierType: 'employee',
            status: ShipmentStatus.assigned,
            notes: `Hệ thống tự động phân công cho ${bestEmp.fullName} (${bestEmp.employeeCode}) - Phòng Vận chuyển & Giao nhận`,
          },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            status: ShipmentStatus.assigned,
            location: 'Trung tâm phân phối MIVA Hub',
            description: `Hệ thống tự động phân công kiện hàng cho nhân sự ${bestEmp.fullName} (${bestEmp.employeeCode}) (Phòng Vận chuyển & Giao nhận)`,
            actorRole: user.role,
            actorId: user.userID,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: shipment.orderId,
            employeeId: bestEmp.id,
            fromStatus: shipment.order.status,
            toStatus: shipment.order.status,
            note: `[Tự động phân công] Hệ thống phân công bưu tá [${bestEmp.fullName} / ${bestEmp.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách kiện ${shipment.trackingNumber}`,
          },
        });
      });
      const payload = { shipmentId: shipment.id, orderId: shipment.orderId, status: ShipmentStatus.assigned };
      this.realtime.emitToAdmins('shipment:updated', payload);
      this.realtime.emitToEmployees('shipment:updated', payload);
      this.realtime.emitToUser(bestEmp.id, 'shipment:updated', payload);
      count++;
    }

    // 2. Also check active orders without any shipments
    const ordersWithoutShipment = await this.prisma.order.findMany({
      where: {
        shipments: { none: {} },
        status: { notIn: [OrderStatus.completed, OrderStatus.cancelled] },
      },
    });

    for (const order of ordersWithoutShipment) {
      const bestEmp = await this.findBestShipperEmployee();
      if (!bestEmp) break;

      const now = new Date();
      const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const tracking = `SHIP-${yearMonth}-${uniqueCodeSuffix()}`;

      await this.prisma.$transaction(async (tx) => {
        const s = await tx.shipment.create({
          data: {
            trackingNumber: tracking,
            orderId: order.id,
            carrierId: bestEmp.id,
            carrierType: 'employee',
            status: ShipmentStatus.assigned,
            shippingAddress: order.shippingAddress,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            notes: `Hệ thống tự động phân công cho ${bestEmp.fullName} (${bestEmp.employeeCode}) - Phòng Vận chuyển & Giao nhận`,
          },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: s.id,
            status: ShipmentStatus.assigned,
            location: 'Trung tâm phân phối MIVA Hub',
            description: `Hệ thống tự động phân công kiện hàng cho bưu tá ${bestEmp.fullName} (${bestEmp.employeeCode}) (Phòng Vận chuyển & Giao nhận)`,
            actorRole: user.role,
            actorId: user.userID,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            employeeId: bestEmp.id,
            fromStatus: order.status,
            toStatus: order.status,
            note: `[Tự động phân công] Hệ thống phân công bưu tá [${bestEmp.fullName} / ${bestEmp.employeeCode}] (Phòng Vận chuyển & Giao nhận) phụ trách giao nhận đơn hàng`,
          },
        });
      });
      count++;
    }

    return {
      success: true,
      message: `Đã tự động phân công bưu tá thành công cho ${count} đơn / kiện hàng`,
      assignedCount: count,
    };
  }

  private async assertCanView(
    order: any,
    user: UserInfo,
  ) {
    if (user.role === 'admin' || order.clientId === user.userID) return;

    if (user.role === 'employee') {
      const isAssigned =
        (order.shipments || []).some((s: any) => s.carrierId === user.userID) ||
        (order.statusHistory || []).some((h: any) => h.employeeId === user.userID);
      if (isAssigned) return;

      const emp = await this.prisma.employee.findUnique({
        where: { id: user.userID },
        select: { department: true, assignedOrderScope: true },
      });

      if (emp) {
        if (emp.assignedOrderScope === 'all_orders') return;
        const isVendorLink = emp.department.includes('Điều phối');
        const isShipping = emp.department.includes('Vận chuyển');
        const isExceptions = emp.department.includes('Sự cố');

        if (isVendorLink && (order.status === OrderStatus.pending || order.status === OrderStatus.confirmed)) return;
        if (isShipping && (order.status === OrderStatus.shipping || (order.shipments || []).some((s: any) => s.carrierId === user.userID))) return;
        if (isExceptions && (order.status === OrderStatus.cancelled || (order.shipments || []).some((s: any) => s.status === ShipmentStatus.failed || s.status === ShipmentStatus.returned))) return;
      }

      throw new ForbiddenException('Bạn không được phân công phụ trách đơn hàng này');
    }

    const vendorIds = new Set(
      (order.details || []).map(
        (item: any) => item.productVariant?.productColor?.product?.vendorId,
      ),
    );
    if (user.role !== 'vendor' || !vendorIds.has(user.userID)) {
      throw new ForbiddenException('Bạn không có quyền xem đơn hàng này');
    }
  }

  private emitOrder(
    order: {
      id: string;
      orderCode: string;
      clientId: string;
      status: OrderStatus;
      details: Array<{
        productVariant: {
          productColor: { product: { id: string; vendorId: string | null } };
        };
      }>;
    },
    event: string,
  ) {
    const payload = {
      orderId: order.id,
      orderCode: order.orderCode,
      status: order.status};
    this.realtime.emitToUser(order.clientId, event, payload);
    this.realtime.emitToAdmins(event, payload);
    this.realtime.emitToEmployees(event, payload);
    for (const vendorId of new Set(
      order.details.map(
        (item) => item.productVariant.productColor.product.vendorId,
      ),
    )) {
      if (vendorId) this.realtime.emitToVendor(vendorId, event, payload);
    }
    for (const product of new Map(
      order.details.map((item) => {
        const product = item.productVariant.productColor.product;
        return [product.id, product] as const;
      }),
    ).values()) {
      if (product.id) this.realtime.emitProductUpdated(product.id, product.vendorId);
    }
  }
}
