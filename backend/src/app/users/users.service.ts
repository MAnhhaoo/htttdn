import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { assertEmailAvailable } from '../../common/utils/account-email/account-email.util';
import {
  formatPaginatedList,
  normalizePagination,
} from '../../common/utils/paginaton-util/pagintion-util.service';
import type { UserInfo } from '../../common/decorators/user.decorator';
import { RealtimeService } from '../realtime/realtime.service';

type AccountRole = 'client' | 'vendor' | 'employee' | 'admin';

const COMMON_ALLOWED_FIELDS = [
  'fullName',
  'email',
  'phone',
  'avatarUrl',
  'status',
] as const;

const ROLE_ALLOWED_FIELDS: Record<AccountRole, readonly string[]> = {
  client: [...COMMON_ALLOWED_FIELDS, 'dateOfBirth', 'gender'],
  vendor: [...COMMON_ALLOWED_FIELDS, 'storeName', 'taxId'],
  employee: [...COMMON_ALLOWED_FIELDS, 'dateOfBirth', 'gender', 'address'],
  admin: [...COMMON_ALLOWED_FIELDS, 'department'],
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly realtime?: RealtimeService,
  ) {}

  private formatClientAddress(
    addresses?: Array<{
      addressLine: string;
      ward?: string | null;
      district?: string | null;
      province?: string | null;
      isDefault?: boolean;
    }>,
  ): string {
    if (!addresses?.length) return '';
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    return [
      defaultAddr.addressLine,
      defaultAddr.ward,
      defaultAddr.district,
      defaultAddr.province,
    ]
      .filter(Boolean)
      .join(', ');
  }

  private formatAccountCode(prefix: string, id: string): string {
    return `${prefix}-${id.slice(0, 8).toUpperCase()}`;
  }

  async getUsers(query: {
    page?: number;
    itemPerPage?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const { page, itemPerPage, skip } = normalizePagination(query);
    const search = query.search?.trim();
    const role = query.role?.toLowerCase();
    const status =
      query.status === 'active' || query.status === 'inactive'
        ? (query.status as UserStatus)
        : undefined;

    if (role === 'vendor') {
      let matchedVendorIds: string[] = [];
      if (search) {
        const hex = search.replace(/^VND-?/i, '');
        if (/^[0-9a-fA-F-]{1,36}$/.test(hex) && this.prisma.$queryRawUnsafe) {
          try {
            const rawMatches: { id: string }[] =
              await this.prisma.$queryRawUnsafe(
                `SELECT id FROM "Vendor" WHERE (id::text ILIKE $1 OR ('VND-' || UPPER(SUBSTRING(id::text, 1, 8))) ILIKE $2)`,
                `%${hex}%`,
                `%${search}%`,
              );
            matchedVendorIds = rawMatches.map((r) => r.id);
          } catch (error) {
            this.logger.warn(
              `Không thể tìm mã vendor bằng truy vấn mở rộng: ${(error as Error).message}`,
            );
          }
        }
      }

      const where: Prisma.VendorWhereInput = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { storeName: { contains: search, mode: 'insensitive' } },
                ...(matchedVendorIds.length > 0
                  ? [{ id: { in: matchedVendorIds } }]
                  : []),
              ],
            }
          : {}),
      };

      const [totalItems, list] = await Promise.all([
        this.prisma.vendor.count({ where }),
        this.prisma.vendor.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            storeName: true,
            taxId: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

      return formatPaginatedList(
        list.map((v) => {
          const code = this.formatAccountCode('VND', v.id);
          return {
            ...v,
            userCode: code,
            vendorCode: code,
            storeCode: code,
            role: 'vendor',
            address: v.storeName || '',
          };
        }),
        totalItems,
        { page, itemPerPage },
      );
    }

    if (role === 'admin') {
      const where: Prisma.AdminWhereInput = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [totalItems, list] = await Promise.all([
        this.prisma.admin.count({ where }),
        this.prisma.admin.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

      return formatPaginatedList(
        list.map((a) => ({
          ...a,
          userCode: this.formatAccountCode('ADM', a.id),
          role: 'admin',
          address: '',
        })),
        totalItems,
        { page, itemPerPage },
      );
    }

    if (role === 'employee') {
      const where: Prisma.EmployeeWhereInput = {
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [totalItems, list] = await Promise.all([
        this.prisma.employee.count({ where }),
        this.prisma.employee.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            employeeCode: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            address: true,
            department: true,
            position: true,
            salary: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

      return formatPaginatedList(
        list.map((e) => ({
          ...e,
          userCode: e.employeeCode || this.formatAccountCode('EMP', e.id),
          role: 'employee',
        })),
        totalItems,
        { page, itemPerPage },
      );
    }

    // Default: role is 'customer' / 'client' or general query
    const where: Prisma.ClientWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [totalItems, list] = await Promise.all([
      this.prisma.client.count({ where }),
      this.prisma.client.findMany({
        where,
        skip,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          gender: true,
          dateOfBirth: true,
          loyaltyPoints: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          addresses: {
            where: { deletedAt: null },
            select: {
              addressLine: true,
              ward: true,
              district: true,
              province: true,
              isDefault: true,
            },
          },
        },
      }),
    ]);

    return formatPaginatedList(
      list.map((c) => {
        const code = this.formatAccountCode('CUS', c.id);
        return {
          id: c.id,
          userCode: code,
          clientCode: code,
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          avatarUrl: c.avatarUrl,
          gender: c.gender,
          dateOfBirth: c.dateOfBirth,
          loyaltyPoints: c.loyaltyPoints,
          status: c.status,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          address: this.formatClientAddress(c.addresses),
          role: 'customer',
        };
      }),
      totalItems,
      { page, itemPerPage },
    );
  }

  async getUser(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        gender: true,
        dateOfBirth: true,
        loyaltyPoints: true,
        status: true,
        createdAt: true,
        addresses: {
          where: { deletedAt: null },
          select: {
            addressLine: true,
            ward: true,
            district: true,
            province: true,
            isDefault: true,
          },
        },
      },
    });
    if (client) {
      const code = this.formatAccountCode('CUS', client.id);
      return {
        id: client.id,
        userCode: code,
        clientCode: code,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        avatarUrl: client.avatarUrl,
        gender: client.gender,
        dateOfBirth: client.dateOfBirth,
        loyaltyPoints: client.loyaltyPoints,
        status: client.status,
        createdAt: client.createdAt,
        address: this.formatClientAddress(client.addresses),
        role: 'customer',
      };
    }

    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        storeName: true,
        taxId: true,
        status: true,
        createdAt: true,
      },
    });
    if (vendor) {
      const code = this.formatAccountCode('VND', vendor.id);
      return {
        ...vendor,
        userCode: code,
        vendorCode: code,
        address: vendor.storeName || '',
        role: 'vendor',
      };
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
      },
    });
    if (admin) {
      return {
        ...admin,
        userCode: this.formatAccountCode('ADM', admin.id),
        address: '',
        role: 'admin',
      };
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        address: true,
        department: true,
        position: true,
        salary: true,
        status: true,
        createdAt: true,
      },
    });
    if (employee) {
      return {
        ...employee,
        userCode:
          employee.employeeCode || this.formatAccountCode('EMP', employee.id),
        role: 'employee',
      };
    }

    throw new NotFoundException('Người dùng không tồn tại');
  }

  private async assertCanChangeStatus(
    id: string,
    targetRole: AccountRole,
    nextStatus: string | undefined,
    currentUser?: UserInfo,
  ) {
    if (nextStatus !== 'inactive') return;

    if (currentUser?.userID && id === currentUser.userID) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản của chính mình',
      );
    }

    if (targetRole === 'admin') {
      const allActiveAdmins = await this.prisma.admin.findMany({
        where: { status: 'active' },
        select: { id: true },
      });
      const remainingActiveAdmins = allActiveAdmins.filter(
        (a) => a.id !== id,
      ).length;
      if (remainingActiveAdmins === 0) {
        throw new BadRequestException(
          'Không thể khóa tài khoản quản trị viên đang hoạt động cuối cùng',
        );
      }
    }
  }

  private async syncClientDefaultAddress(
    clientId: string,
    fullName: string,
    phone: string | null,
    address: string | null,
  ) {
    if (!this.prisma.clientAddress) return;
    const trimmed = address ? String(address).trim() : '';
    if (!trimmed) return;

    const existingDefault = await this.prisma.clientAddress.findFirst({
      where: { clientId, isDefault: true, deletedAt: null },
    });

    if (existingDefault) {
      await this.prisma.clientAddress.update({
        where: { id: existingDefault.id },
        data: { addressLine: trimmed },
      });
    } else {
      await this.prisma.clientAddress.create({
        data: {
          clientId,
          receiverName: fullName,
          phone: phone || '',
          addressLine: trimmed,
          isDefault: true,
        },
      });
    }
  }

  async updateUser(
    id: string,
    data: Record<string, any>,
    currentUser?: UserInfo,
  ) {
    const {
      role: _r,
      password: _p,
      id: _i,
      deletedAt: _d,
      address,
      ...rawUpdateData
    } = data ?? {};

    const updateData: Record<string, any> = { ...rawUpdateData };
    if (typeof updateData.dateOfBirth === 'string') {
      updateData.dateOfBirth = new Date(
        `${updateData.dateOfBirth}T00:00:00.000Z`,
      );
    }
    if (typeof updateData.email === 'string') {
      updateData.email = updateData.email.trim().toLowerCase();
    }

    const pickAllowed = (role: AccountRole, source: Record<string, any>) => {
      const allowed = ROLE_ALLOWED_FIELDS[role];
      const keys = Object.keys(source);
      const invalid = keys.filter((k) => !allowed.includes(k));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Dữ liệu cập nhật chứa trường không hợp lệ: ${invalid.join(', ')}`,
        );
      }
      return Object.fromEntries(
        Object.entries(source).filter(
          ([key, value]) => allowed.includes(key) && value !== undefined,
        ),
      );
    };

    const roles: AccountRole[] = ['client', 'vendor', 'employee', 'admin'];
    for (const role of roles) {
      const delegate = (this.prisma as any)[role];
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) continue;

      const sourceWithAddress =
        role === 'employee' && address !== undefined
          ? { ...updateData, address }
          : updateData;

      const roleData = pickAllowed(role, sourceWithAddress);
      await this.assertCanChangeStatus(id, role, roleData.status, currentUser);

      if (roleData.email) {
        await assertEmailAvailable(this.prisma, roleData.email, { role, id });
      }
      if (roleData.status && existing.deletedAt) {
        roleData.deletedAt = null;
      }

      const updated = await delegate.update({
        where: { id },
        data: roleData,
      });

      if (role === 'client' && address !== undefined) {
        await this.syncClientDefaultAddress(
          id,
          updated.fullName,
          updated.phone,
          address,
        );
      }

      if (roleData.status === 'inactive') {
        this.realtime?.disconnectUser(id);
      }

      const { password: _, ...rest } = updated;
      return rest;
    }

    throw new NotFoundException('Người dùng không tồn tại');
  }

  async updateUserStatus(
    id: string,
    status: 'active' | 'inactive',
    currentUser?: UserInfo,
  ) {
    if (status !== 'active' && status !== 'inactive') {
      throw new BadRequestException(
        'Trạng thái tài khoản chỉ được là active hoặc inactive',
      );
    }
    return this.updateUser(id, { status }, currentUser);
  }

  /**
   * Tài khoản chỉ khóa (status = inactive), không xóa.
   */
  async deleteUser(id: string, currentUser?: UserInfo) {
    return this.updateUserStatus(id, 'inactive', currentUser);
  }
}
