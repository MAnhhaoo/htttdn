import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: {
    page?: number;
    itemPerPage?: number;
    role?: string;
    search?: string;
    status?: string;
  }) {
    const page = Number(query.page) || 1;
    const itemPerPage = Number(query.itemPerPage) || 10;
    const skip = (page - 1) * itemPerPage;
    const search = query.search?.trim();
    const role = query.role?.toLowerCase();
    const status = query.status as any;

    if (role === 'vendor') {
      let matchedVendorIds: string[] = [];
      const cleanSearch = search?.trim();
      if (cleanSearch) {
        const hex = cleanSearch.replace(/^VND-?/i, '');
        if (/^[0-9a-fA-F-]{1,36}$/.test(hex)) {
          try {
            const rawMatches: { id: string }[] = await this.prisma.$queryRawUnsafe(
              `SELECT id FROM "Vendor" WHERE (id::text ILIKE $1 OR ('VND-' || UPPER(SUBSTRING(id::text, 1, 8))) ILIKE $2) AND "deletedAt" IS NULL`,
              `%${hex}%`,
              `%${cleanSearch}%`
            );
            matchedVendorIds = rawMatches.map((r) => r.id);
          } catch (e) {
            // fallback
          }
        }
      }

      const where: Prisma.VendorWhereInput = {
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { storeName: { contains: search, mode: 'insensitive' } },
                ...(matchedVendorIds.length > 0 ? [{ id: { in: matchedVendorIds } }] : []),
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

      return {
        list: list.map((v) => ({
          ...v,
          vendorCode: `VND-${v.id.slice(0, 8).toUpperCase()}`,
          storeCode: `VND-${v.id.slice(0, 8).toUpperCase()}`,
          role: 'vendor',
          address: v.storeName || '',
        })),
        page,
        itemPerPage,
        totalItems,
        totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      };
    }

    if (role === 'admin') {
      const where: Prisma.AdminWhereInput = {
        deletedAt: null,
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

      return {
        list: list.map((a) => ({ ...a, role: 'admin', address: '' })),
        page,
        itemPerPage,
        totalItems,
        totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      };
    }

    if (role === 'employee') {
      const where: Prisma.EmployeeWhereInput = {
        deletedAt: null,
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

      return {
        list: list.map((e) => ({ ...e, role: 'employee' })),
        page,
        itemPerPage,
        totalItems,
        totalPages: Math.ceil(totalItems / itemPerPage) || 1,
      };
    }

    // Default: role is 'customer' / 'client' or general query
    const where: Prisma.ClientWhereInput = {
      deletedAt: null,
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

    return {
      list: list.map((c) => {
        const defaultAddr =
          c.addresses.find((a) => a.isDefault) || c.addresses[0];
        const formattedAddress = defaultAddr
          ? [
              defaultAddr.addressLine,
              defaultAddr.ward,
              defaultAddr.district,
              defaultAddr.province,
            ]
              .filter(Boolean)
              .join(', ')
          : '';

        return {
          id: c.id,
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
          address: formattedAddress,
          role: 'customer',
        };
      }),
      page,
      itemPerPage,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage) || 1,
    };
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
      const defaultAddr =
        client.addresses.find((a) => a.isDefault) || client.addresses[0];
      const formattedAddress = defaultAddr
        ? [
            defaultAddr.addressLine,
            defaultAddr.ward,
            defaultAddr.district,
            defaultAddr.province,
          ]
            .filter(Boolean)
            .join(', ')
        : '';
      return {
        id: client.id,
        fullName: client.fullName,
        email: client.email,
        phone: client.phone,
        avatarUrl: client.avatarUrl,
        gender: client.gender,
        dateOfBirth: client.dateOfBirth,
        loyaltyPoints: client.loyaltyPoints,
        status: client.status,
        createdAt: client.createdAt,
        address: formattedAddress,
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
      return {
        ...vendor,
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
    if (admin) return { ...admin, address: '', role: 'admin' };

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
    if (employee) return { ...employee, role: 'employee' };

    throw new NotFoundException('Người dùng không tồn tại');
  }

  async updateUser(id: string, data: any) {
    const { role: _r, password: _p, id: _i, address: _a, ...updateData } = data;

    // Check client
    const isClient = await this.prisma.client.findUnique({ where: { id } });
    if (isClient) {
      const updated = await this.prisma.client.update({
        where: { id },
        data: updateData,
      });
      const { password: _, ...rest } = updated;
      return rest;
    }

    // Check vendor
    const isVendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (isVendor) {
      const updated = await this.prisma.vendor.update({
        where: { id },
        data: updateData,
      });
      const { password: _, ...rest } = updated;
      return rest;
    }

    // Check employee
    const isEmployee = await this.prisma.employee.findUnique({ where: { id } });
    if (isEmployee) {
      const updated = await this.prisma.employee.update({
        where: { id },
        data: updateData,
      });
      const { password: _, ...rest } = updated;
      return rest;
    }

    // Check admin
    const isAdmin = await this.prisma.admin.findUnique({ where: { id } });
    if (isAdmin) {
      const updated = await this.prisma.admin.update({
        where: { id },
        data: updateData,
      });
      const { password: _, ...rest } = updated;
      return rest;
    }

    throw new NotFoundException('Người dùng không tồn tại');
  }

  async deleteUser(id: string) {
    return this.updateUser(id, {
      status: 'inactive',
      deletedAt: new Date(),
    });
  }
}
