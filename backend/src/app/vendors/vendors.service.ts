import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaBaseService } from '../../common/service/prisma-base.service';

import { PrismaService } from '../../common/prisma/prisma.service';

import { PaginationUtilService } from '../../common/utils/paginaton-util/pagintion-util.service';

import { QueryUtilService } from '../../common/utils/query-util/query-util.service';

import { assertEmailAvailable } from '../../common/utils/account-email/account-email.util';

import {
  GetOptionsParams,
  Options} from '../../common/query/options.interface';

import { CreateVendorDto } from './dto/create-vendor.dto';

import { UpdateVendorDto } from './dto/update-vendor.dto';

import { GetVendorsPaginationDto } from './dto/get-vendor.dto';

import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService
  extends PrismaBaseService<'vendor'>
  implements Options<Vendor>
{
  constructor(
    prismaService: PrismaService,

    private readonly paginationUtilService: PaginationUtilService,

    private readonly queryUtil: QueryUtilService,
  ) {
    super(prismaService, 'vendor');
  }

  async getVendors({ status, role, ...query }: GetVendorsPaginationDto) {
    return this.findVendors(query, {
      ...(status ? { status } : {}),
      ...(role ? { role } : {})});
  }

  private async findVendors(
    { page = 1, itemPerPage = 10, search }: GetVendorsPaginationDto,
    scope: Prisma.VendorWhereInput,
  ) {
    const searchCondition = this.queryUtil.createStringSearchCondition(search, [
      'fullName',
      'email',
      'phone',
      'address',
    ]) as Prisma.VendorWhereInput;

    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
      ...scope,
      ...searchCondition};

    const totalItems = await this.extended.count({
      where});

    const paging = this.paginationUtilService.paging({
      page,
      itemPerPage,
      totalItems});

    const list = await this.extended.findMany({
      omit: { password: true },
      where,
      skip: paging.skip,
      take: Number(itemPerPage),
      orderBy: {
        createdAt: 'desc'}});

    return paging.format(list);
  }

  /**
   * Lấy danh sách rút gọn.
   * Thường dùng cho dropdown/select.
   */
  async getOptions(params: GetOptionsParams<Vendor>) {
    const { limit = 10, select = 'id,fullName', ...searchFields } = params;

    const requestedFields =
      this.queryUtil.convertFieldsSelectOption(select) ?? {};
    const publicFields = [
      'id',
      'fullName',
      'email',
      'phone',
      'address',
      'role',
      'status',
      'createdAt',
      'updatedAt',
      'deletedAt',
      'createdBy',
    ];
    const fieldsSelect = Object.fromEntries(
      Object.entries(requestedFields).filter(([field]) =>
        publicFields.includes(field),
      ),
    );
    if (!Object.values(fieldsSelect).some(Boolean)) {
      fieldsSelect.id = true;
    }

    return this.extended.findMany({
      select: fieldsSelect,

      where: {
        deletedAt: null,
        ...searchFields},

      take: Number(limit),

      orderBy: {
        fullName: 'asc'}});
  }

  async getVendor(where: Prisma.VendorWhereUniqueInput) {
    const vendor = await this.extended.findUnique({
      where,
      omit: { password: true },
      include: {
        _count: {
          select: {
            products: { where: { deletedAt: null } },
            vendorOrders: true,
            vouchers: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const revenueAgg = await this.prismaService.vendorOrder.aggregate({
      where: {
        vendorId: vendor.id,
        status: { in: ['delivered', 'shipping', 'processing', 'confirmed'] },
      },
      _sum: { totalAmount: true },
    });

    const now = new Date();
    const isExpired = vendor.subscriptionExpiresAt ? new Date(vendor.subscriptionExpiresAt) < now : false;
    const daysRemaining = vendor.subscriptionExpiresAt
      ? Math.ceil((new Date(vendor.subscriptionExpiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24))
      : null;

    return {
      ...vendor,
      totalRevenue: Number(revenueAgg._sum.totalAmount) || 0,
      isExpired,
      daysRemaining,
      stats: {
        productCount: vendor._count?.products || 0,
        orderCount: vendor._count?.vendorOrders || 0,
        voucherCount: vendor._count?.vouchers || 0,
      },
    };
  }

  async createVendor(createVendorDto: CreateVendorDto) {
    const { address, ...vendorData } = createVendorDto as any;
    if (typeof vendorData.email === 'string') {
      vendorData.email = vendorData.email.trim().toLowerCase();
      await assertEmailAvailable(this.prismaService, vendorData.email);
    }
    return this.extended.create({
      data: vendorData});
  }

  async getVendorByEmail(email: string) {
    return this.extended.findUnique({
      where: {
        email}});
  }

  async getstring(vendorID: string) {
    return this.prismaService.vendor.findUnique({
      where: {
        id: vendorID},

      select: {
        id: true,
        
        status: true,
        deletedAt: true}});
  }

  async updateVendor(params: {
    where: Prisma.VendorWhereUniqueInput;
    data: UpdateVendorDto;
  }) {
    const { where, data: dataUpdate } = params;
    const { address, ...vendorData } = dataUpdate as any;

    if (typeof vendorData.email === 'string') {
      vendorData.email = vendorData.email.trim().toLowerCase();
      const current = where.id
        ? { id: where.id }
        : await this.prismaService.vendor.findUnique({ where, select: { id: true } });
      await assertEmailAvailable(
        this.prismaService,
        vendorData.email,
        current ? { role: 'vendor', id: current.id } : undefined,
      );
    }

    const data = await this.extended.update({
      data: vendorData,
      where,
      omit: { password: true }});

    return data;
  }

  async deleteVendor(where: Prisma.VendorWhereUniqueInput) {
    const vendor = await this.extended.findUnique({
      where});

    if (!vendor) {
      throw new NotFoundException('Vendor không tồn tại');
    }

    return this.extended.update({
      where,
      omit: { password: true },

      data: {
        status: 'inactive'}});
  }

  async getSubscriptionMe(vendorId: string) {
    const vendor = await this.extended.findUnique({
      where: { id: vendorId },
      omit: { password: true },
    });
    if (!vendor) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác');
    }

    const now = new Date();
    const isExpired = vendor.subscriptionExpiresAt ? new Date(vendor.subscriptionExpiresAt) < now : false;
    const daysRemaining = vendor.subscriptionExpiresAt
      ? Math.ceil((new Date(vendor.subscriptionExpiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24))
      : null;

    return {
      ...vendor,
      isExpired,
      daysRemaining,
      isExpiringSoon: daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 30,
    };
  }

  async renewSubscription(vendorId: string, plan: string) {
    const validPlan = plan === '2_years' ? '2_years' : '1_year';
    const fee = validPlan === '2_years' ? 2000000 : 1200000;

    const updated = await this.extended.update({
      where: { id: vendorId },
      data: {
        renewalRequested: true,
        renewalPlan: validPlan,
        renewalRequestedAt: new Date(),
        subscriptionFee: fee,
      },
      omit: { password: true },
    });

    return this.getSubscriptionMe(vendorId);
  }

  async getRegistrations(query: {
    page?: number;
    itemPerPage?: number;
    tab?: string;
    search?: string;
  }) {
    const page = Number(query.page) || 1;
    const itemPerPage = Number(query.itemPerPage) || 10;
    const tab = query.tab || 'pending';
    const search = query.search?.trim();
    const now = new Date();

    const searchCondition: Prisma.VendorWhereInput = search
      ? {
          OR: [
            { storeName: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { taxId: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    let tabCondition: Prisma.VendorWhereInput = {};
    if (tab === 'pending') {
      tabCondition = { approvalStatus: 'pending_approval' };
    } else if (tab === 'renewals') {
      tabCondition = { renewalRequested: true };
    } else if (tab === 'active') {
      tabCondition = {
        approvalStatus: 'approved',
        status: 'active',
        OR: [
          { subscriptionExpiresAt: null },
          { subscriptionExpiresAt: { gte: now } },
        ],
      };
    } else if (tab === 'expired') {
      tabCondition = {
        OR: [
          { subscriptionExpiresAt: { lt: now } },
          { status: 'inactive' },
        ],
      };
    } else if (tab === 'rejected') {
      tabCondition = { approvalStatus: 'rejected' };
    }

    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
      ...tabCondition,
      ...searchCondition,
    };

    const [
      totalItems,
      list,
      pendingCount,
      renewalsCount,
      activeCount,
      expiredCount,
      rejectedCount,
    ] = await Promise.all([
      this.extended.count({ where }),
      this.extended.findMany({
        where,
        omit: { password: true },
        skip: (page - 1) * itemPerPage,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.extended.count({ where: { deletedAt: null, approvalStatus: 'pending_approval' } }),
      this.extended.count({ where: { deletedAt: null, renewalRequested: true } }),
      this.extended.count({
        where: {
          deletedAt: null,
          approvalStatus: 'approved',
          status: 'active',
          OR: [
            { subscriptionExpiresAt: null },
            { subscriptionExpiresAt: { gte: now } },
          ],
        },
      }),
      this.extended.count({
        where: {
          deletedAt: null,
          OR: [
            { subscriptionExpiresAt: { lt: now } },
            { status: 'inactive' },
          ],
        },
      }),
      this.extended.count({ where: { deletedAt: null, approvalStatus: 'rejected' } }),
    ]);

    const formattedList = list.map((v) => {
      const isExp = v.subscriptionExpiresAt ? new Date(v.subscriptionExpiresAt) < now : false;
      const daysRem = v.subscriptionExpiresAt
        ? Math.ceil((new Date(v.subscriptionExpiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24))
        : null;
      return {
        ...v,
        isExpired: isExp,
        daysRemaining: daysRem,
      };
    });

    return {
      list: formattedList,
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      counts: {
        pending: pendingCount,
        renewals: renewalsCount,
        active: activeCount,
        expired: expiredCount,
        rejected: rejectedCount,
      },
    };
  }

  async approveRegistration(
    id: string,
    user: any,
    data?: { plan?: string; commissionRate?: number; note?: string },
  ) {
    if (user.role === 'employee') {
      const emp = await this.prismaService.employee.findUnique({ where: { id: user.userID } });
      const perms: any = emp?.permissions || {};
      if (perms.restrictions?.canManageVendors === true && !perms.vendors?.canApproveVendor) {
        throw new ForbiddenException('Nhân viên không có quyền phê duyệt hồ sơ đối tác');
      }
    }

    const vendor = await this.extended.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Không tìm thấy đối tác');
    }

    const now = new Date();
    const plan = data?.plan || vendor.renewalPlan || vendor.subscriptionPlan || '1_year';
    const years = plan === '2_years' ? 2 : 1;
    const fee = plan === '2_years' ? 2000000 : 1200000;
    const commissionRate = data?.commissionRate !== undefined ? data.commissionRate : (vendor.commissionRate || 8.00);

    let newExpiresAt: Date;
    if (vendor.renewalRequested && vendor.subscriptionExpiresAt && vendor.subscriptionExpiresAt > now) {
      newExpiresAt = new Date(vendor.subscriptionExpiresAt.getTime() + years * 365 * 24 * 3600 * 1000);
    } else {
      newExpiresAt = new Date(now.getTime() + years * 365 * 24 * 3600 * 1000);
    }

    const approverName = user.fullName || user.userEmail || (user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên kiểm duyệt');

    const updated = await this.extended.update({
      where: { id },
      data: {
        approvalStatus: 'approved',
        status: 'active',
        subscriptionPlan: plan,
        subscriptionFee: fee,
        subscriptionExpiresAt: newExpiresAt,
        commissionRate: commissionRate,
        approvedAt: now,
        approvedBy: approverName,
        rejectedReason: null,
        renewalRequested: false,
        renewalPlan: null,
        renewalRequestedAt: null,
      },
      omit: { password: true },
    });

    return updated;
  }

  async rejectRegistration(id: string, user: any, reason: string) {
    if (user.role === 'employee') {
      const emp = await this.prismaService.employee.findUnique({ where: { id: user.userID } });
      const perms: any = emp?.permissions || {};
      if (perms.restrictions?.canManageVendors === true && !perms.vendors?.canApproveVendor) {
        throw new ForbiddenException('Nhân viên không có quyền phê duyệt hồ sơ đối tác');
      }
    }

    const vendor = await this.extended.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Không tìm thấy đối tác');
    }

    const updated = await this.extended.update({
      where: { id },
      data: {
        approvalStatus: 'rejected',
        status: 'inactive',
        rejectedReason: reason || 'Hồ sơ đăng ký hoặc yêu cầu gia hạn chưa đạt yêu cầu.',
        renewalRequested: false,
      },
      omit: { password: true },
    });

    return updated;
  }

  async getPublicVendorProfile(id: string) {
    const vendor = await this.extended.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        storeName: true,
        fullName: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Người bán không tồn tại');
    }

    const totalProducts = await this.prismaService.product.count({
      where: {
        vendorId: id,
        deletedAt: null,
        status: 'active',
      },
    });

    const totalOrders = await this.prismaService.vendorOrder.count({
      where: {
        vendorId: id,
      },
    });

    const reviewsAgg = await this.prismaService.review.aggregate({
      where: {
        product: {
          vendorId: id,
          deletedAt: null,
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const joinDate = new Date(vendor.createdAt);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - joinDate.getFullYear()) * 12 +
      (now.getMonth() - joinDate.getMonth());
    const joinedText =
      diffMonths >= 12
        ? `${Math.floor(diffMonths / 12)} năm trước`
        : diffMonths > 0
          ? `${diffMonths} tháng trước`
          : 'Gần đây';

    const categories = await this.prismaService.category.findMany({
      where: {
        deletedAt: null,
        products: {
          some: {
            vendorId: id,
            deletedAt: null,
            status: 'active',
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const categoryCounts = await this.prismaService.product.groupBy({
      by: ['categoryId'],
      where: {
        vendorId: id,
        deletedAt: null,
        status: 'active',
      },
      _count: {
        id: true,
      },
    });

    const countMap = new Map(
      categoryCounts.map((item) => [item.categoryId, item._count.id]),
    );

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.id) || 0,
    }));

    return {
      ...vendor,
      stats: {
        rating: reviewsAgg._avg.rating
          ? Number(reviewsAgg._avg.rating.toFixed(1))
          : 5.0,
        reviewCount: reviewsAgg._count.id || 0,
        totalProducts,
        totalOrders,
        responseRate: '100%',
        responseTime: 'trong vài phút',
        joinedText,
        followersCount: Math.max(12, totalOrders * 3 + totalProducts * 2),
      },
      categories: categoriesWithCount,
    };
  }
}
