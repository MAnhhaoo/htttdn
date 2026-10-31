import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
  vendor: [...COMMON_ALLOWED_FIELDS, 'storeName', 'taxId', 'address'],
  employee: [...COMMON_ALLOWED_FIELDS, 'dateOfBirth', 'gender', 'address'],
  admin: [...COMMON_ALLOWED_FIELDS, 'department'],
};

const CLIENT_ACCOUNT_SELECT = {
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
} satisfies Prisma.ClientSelect;

const VENDOR_ACCOUNT_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  storeName: true,
  taxId: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorSelect;

const ADMIN_ACCOUNT_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  status: true,
  createdAt: true,
} satisfies Prisma.AdminSelect;

const EMPLOYEE_ACCOUNT_SELECT = {
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
} satisfies Prisma.EmployeeSelect;

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

  /**
   * Xây dựng điều kiện lọc tài khoản dùng chung cho cả 4 bảng (Client, Vendor, Admin, Employee).
   */
  private buildAccountSearchWhere<TWhere = Record<string, unknown>>(params: {
    search?: string;
    status?: UserStatus;
    searchFields: string[];
    extraOr?: Record<string, unknown>[];
    extraWhere?: Record<string, unknown>;
  }): TWhere {
    const {
      search,
      status,
      searchFields,
      extraOr = [],
      extraWhere = {},
    } = params;
    return {
      ...extraWhere,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              ...searchFields.map((field) => ({
                [field]: { contains: search, mode: 'insensitive' as const },
              })),
              ...extraOr,
            ],
          }
        : {}),
    } as TWhere;
  }

  private mapVendorRecord(
    v: Prisma.VendorGetPayload<{ select: typeof VENDOR_ACCOUNT_SELECT }>,
  ) {
    const code = this.formatAccountCode('VND', v.id);
    return {
      ...v,
      userCode: code,
      vendorCode: code,
      storeCode: code,
      role: 'vendor',
      address: v.address || v.storeName || '',
    };
  }

  private mapAdminRecord(
    a: Prisma.AdminGetPayload<{ select: typeof ADMIN_ACCOUNT_SELECT }>,
  ) {
    return {
      ...a,
      userCode: this.formatAccountCode('ADM', a.id),
      role: 'admin',
      address: '',
    };
  }

  private mapEmployeeRecord(
    e: Prisma.EmployeeGetPayload<{ select: typeof EMPLOYEE_ACCOUNT_SELECT }>,
  ) {
    return {
      ...e,
      userCode: e.employeeCode || this.formatAccountCode('EMP', e.id),
      role: 'employee',
    };
  }

  private mapClientRecord(
    c: Prisma.ClientGetPayload<{ select: typeof CLIENT_ACCOUNT_SELECT }>,
  ) {
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
        if (/^[0-9a-fA-F-]{1,36}$/.test(hex)) {
          try {
            const rawMatches: { id: string }[] =
              await this.prisma.extended.$queryRaw`
                SELECT id FROM "Vendor"
                WHERE id::text ILIKE ${`%${hex}%`}
                   OR ('VND-' || UPPER(SUBSTRING(id::text, 1, 8))) ILIKE ${`%${search}%`}
              `;
            matchedVendorIds = rawMatches.map((r) => r.id);
          } catch (error) {
            this.logger.warn(
              `Không thể tìm mã vendor bằng truy vấn mở rộng: ${(error as Error).message}`,
            );
          }
        }
      }

      const where = this.buildAccountSearchWhere<Prisma.VendorWhereInput>({
        search,
        status,
        searchFields: ['fullName', 'email', 'phone', 'storeName'],
        extraOr:
          matchedVendorIds.length > 0 ? [{ id: { in: matchedVendorIds } }] : [],
      });

      const [totalItems, list] = await Promise.all([
        this.prisma.extended.vendor.count({ where }),
        this.prisma.extended.vendor.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: VENDOR_ACCOUNT_SELECT,
        }),
      ]);

      return formatPaginatedList(
        list.map((v) => this.mapVendorRecord(v)),
        totalItems,
        { page, itemPerPage },
      );
    }

    if (role === 'admin') {
      const where = this.buildAccountSearchWhere<Prisma.AdminWhereInput>({
        search,
        status,
        searchFields: ['fullName', 'email', 'phone'],
      });

      const [totalItems, list] = await Promise.all([
        this.prisma.extended.admin.count({ where }),
        this.prisma.extended.admin.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: ADMIN_ACCOUNT_SELECT,
        }),
      ]);

      return formatPaginatedList(
        list.map((a) => this.mapAdminRecord(a)),
        totalItems,
        { page, itemPerPage },
      );
    }

    if (role === 'employee') {
      const where = this.buildAccountSearchWhere<Prisma.EmployeeWhereInput>({
        search,
        status,
        searchFields: ['fullName', 'email', 'employeeCode'],
      });

      const [totalItems, list] = await Promise.all([
        this.prisma.extended.employee.count({ where }),
        this.prisma.extended.employee.findMany({
          where,
          skip,
          take: itemPerPage,
          orderBy: { createdAt: 'desc' },
          select: EMPLOYEE_ACCOUNT_SELECT,
        }),
      ]);

      return formatPaginatedList(
        list.map((e) => this.mapEmployeeRecord(e)),
        totalItems,
        { page, itemPerPage },
      );
    }

    // Default: role is 'customer' / 'client' or general query
    const where = this.buildAccountSearchWhere<Prisma.ClientWhereInput>({
      search,
      status,
      searchFields: ['fullName', 'email', 'phone'],
      extraWhere: { deletedAt: null },
    });

    const [totalItems, list] = await Promise.all([
      this.prisma.extended.client.count({ where }),
      this.prisma.extended.client.findMany({
        where,
        skip,
        take: itemPerPage,
        orderBy: { createdAt: 'desc' },
        select: CLIENT_ACCOUNT_SELECT,
      }),
    ]);

    return formatPaginatedList(
      list.map((c) => this.mapClientRecord(c)),
      totalItems,
      { page, itemPerPage },
    );
  }

  async createUser(data: Record<string, any>) {
    const email = (data.email || '').trim().toLowerCase();
    const fullName = (data.fullName || '').trim();
    if (!fullName || !email) {
      throw new BadRequestException('Họ tên và Email là bắt buộc');
    }

    await assertEmailAvailable(this.prisma.extended, email);

    const rawPassword = data.password?.trim() || 'admin123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const roleInput = (data.role || 'customer').toLowerCase();
    const status: UserStatus =
      data.status === 'inactive' ? UserStatus.inactive : UserStatus.active;

    if (roleInput === 'vendor' || roleInput === 'seller') {
      const createdVendor = await this.prisma.extended.vendor.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phone: data.phone?.trim() || null,
          avatarUrl: data.avatarUrl?.trim() || null,
          storeName: data.storeName?.trim() || fullName,
          taxId: data.taxId?.trim() || null,
          address: data.address?.trim() || null,
          status,
          approvalStatus: 'approved',
          approvedAt: new Date(),
        },
      });
      return this.getUser(createdVendor.id);
    }

    if (roleInput === 'admin') {
      const createdAdmin = await this.prisma.extended.admin.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          phone: data.phone?.trim() || null,
          avatarUrl: data.avatarUrl?.trim() || null,
          department: data.department?.trim() || null,
          status,
        },
      });
      return this.getUser(createdAdmin.id);
    }

    const dob =
      typeof data.dateOfBirth === 'string' && data.dateOfBirth.trim()
        ? new Date(`${data.dateOfBirth.trim().slice(0, 10)}T00:00:00.000Z`)
        : null;

    const createdClient = await this.prisma.extended.client.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: data.phone?.trim() || null,
        avatarUrl: data.avatarUrl?.trim() || null,
        gender: data.gender || null,
        dateOfBirth: dob,
        status,
      },
    });

    if (data.address?.trim()) {
      await this.syncClientDefaultAddress(
        createdClient.id,
        createdClient.fullName,
        createdClient.phone,
        data.address.trim(),
      );
    }

    return this.getUser(createdClient.id);
  }

  async getUser(id: string) {
    const client = await this.prisma.extended.client.findUnique({
      where: { id },
      select: CLIENT_ACCOUNT_SELECT,
    });
    if (client) {
      return this.mapClientRecord(client);
    }

    const vendor = await this.prisma.extended.vendor.findUnique({
      where: { id },
      select: VENDOR_ACCOUNT_SELECT,
    });
    if (vendor) {
      return this.mapVendorRecord(vendor);
    }

    const admin = await this.prisma.extended.admin.findUnique({
      where: { id },
      select: ADMIN_ACCOUNT_SELECT,
    });
    if (admin) {
      return this.mapAdminRecord(admin);
    }

    const employee = await this.prisma.extended.employee.findUnique({
      where: { id },
      select: EMPLOYEE_ACCOUNT_SELECT,
    });
    if (employee) {
      return this.mapEmployeeRecord(employee);
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
      const allActiveAdmins = await this.prisma.extended.admin.findMany({
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
    if (!this.prisma.extended.clientAddress) return;
    const trimmed = address ? String(address).trim() : '';
    if (!trimmed) return;

    const existingDefault = await this.prisma.extended.clientAddress.findFirst({
      where: { clientId, isDefault: true, deletedAt: null },
    });

    if (existingDefault) {
      await this.prisma.extended.clientAddress.update({
        where: { id: existingDefault.id },
        data: { addressLine: trimmed },
      });
    } else {
      await this.prisma.extended.clientAddress.create({
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
      const delegate = (this.prisma.extended as any)[role];
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) continue;

      const sourceWithAddress =
        (role === 'employee' || role === 'vendor') && address !== undefined
          ? { ...updateData, address }
          : updateData;

      const roleData = pickAllowed(role, sourceWithAddress);
      await this.assertCanChangeStatus(id, role, roleData.status, currentUser);

      if (roleData.email) {
        await assertEmailAvailable(this.prisma.extended, roleData.email, { role, id });
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

  async deleteUser(id: string, currentUser?: UserInfo) {
    const roles: AccountRole[] = ['client', 'vendor', 'employee', 'admin'];
    for (const role of roles) {
      const delegate = (this.prisma.extended as any)[role];
      const existing = await delegate.findUnique({ where: { id } });
      if (!existing) continue;

      await this.assertCanChangeStatus(id, role, UserStatus.inactive, currentUser);
      const updated = await delegate.update({
        where: { id },
        data: {
          status: UserStatus.inactive,
          deletedAt: new Date(),
        },
      });
      this.realtime?.disconnectUser(id);
      const { password: _, ...rest } = updated;
      return rest;
    }
    throw new NotFoundException('Người dùng không tồn tại');
  }
}
