import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { StringUtilService } from 'src/common/utils/string-util/string-util.service';
import {
  CreateEmployeeDto,
  GetEmployeesPaginationDto,
  UpdateEmployeeDto,
} from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stringUtilService: StringUtilService,
  ) {}

  private async generateEmployeeCode(): Promise<string> {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `EMP-${yearMonth}-`;

    const lastEmployee = await this.prisma.employee.findFirst({
      where: {
        employeeCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        employeeCode: 'desc',
      },
      select: {
        employeeCode: true,
      },
    });

    let nextSeq = 1;
    if (lastEmployee?.employeeCode) {
      const parts = lastEmployee.employeeCode.split('-');
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10);
        if (!isNaN(seq)) {
          nextSeq = seq + 1;
        }
      }
    }

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  async getEmployees(query: GetEmployeesPaginationDto) {
    const { page = 1, itemPerPage = 10, q, department, employmentType, status } = query;
    const skip = (page - 1) * itemPerPage;

    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(department ? { department } : {}),
      ...(employmentType ? { employmentType } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { employeeCode: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
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
          department: true,
          position: true,
          employmentType: true,
          salary: true,
          hourlyRate: true,
          hireDate: true,
          status: true,
          assignedOrderScope: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      list,
      totalItems,
      totalPages: Math.ceil(totalItems / itemPerPage),
      currentPage: page,
    };
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        salaryHistories: {
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!employee || employee.deletedAt) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên');
    }

    const { password: _p, ...safeEmployee } = employee;
    return safeEmployee;
  }

  async createEmployee(adminId: string, dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (existing) {
      throw new BadRequestException('Email đã tồn tại trong hệ thống');
    }

    const hashedPassword = await this.stringUtilService.hash(dto.password);
    const employeeCode = await this.generateEmployeeCode();

    const employee = await this.prisma.employee.create({
      data: {
        employeeCode,
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone || null,
        avatarUrl: dto.avatarUrl || null,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender || null,
        citizenId: dto.citizenId || null,
        address: dto.address || null,
        department: dto.department,
        position: dto.position,
        employmentType: dto.employmentType,
        salary: dto.salary,
        hourlyRate: dto.hourlyRate ?? null,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
        assignedOrderScope: dto.assignedOrderScope || 'assigned_orders',
        permissions: (dto.permissions as any) ?? {},
        adminId,
      },
    });

    // Record initial salary history entry
    if (dto.salary > 0 || (dto.hourlyRate && dto.hourlyRate > 0)) {
      await this.prisma.employeeSalaryHistory.create({
        data: {
          employeeId: employee.id,
          newSalary: dto.salary,
          newHourlyRate: dto.hourlyRate ?? null,
          employmentType: dto.employmentType,
          effectiveDate: employee.hireDate,
          reason: 'Mức lương ban đầu khi ký hợp đồng',
          adminId,
        },
      });
    }

    const { password: _p, ...safeEmployee } = employee;
    return safeEmployee;
  }

  async updateEmployee(adminId: string, id: string, dto: UpdateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên');
    }

    const isSalaryChanged =
      (dto.salary !== undefined && Number(dto.salary) !== Number(existing.salary)) ||
      (dto.hourlyRate !== undefined &&
        Number(dto.hourlyRate || 0) !== Number(existing.hourlyRate || 0)) ||
      (dto.employmentType !== undefined && dto.employmentType !== existing.employmentType);

    if (isSalaryChanged) {
      await this.prisma.employeeSalaryHistory.create({
        data: {
          employeeId: existing.id,
          oldSalary: existing.salary,
          newSalary: dto.salary !== undefined ? dto.salary : existing.salary,
          oldHourlyRate: existing.hourlyRate,
          newHourlyRate:
            dto.hourlyRate !== undefined ? dto.hourlyRate : existing.hourlyRate,
          employmentType: dto.employmentType || existing.employmentType,
          effectiveDate: new Date(),
          reason: dto.salaryAdjustmentReason || 'Điều chỉnh lương định kỳ từ ban quản trị',
          adminId,
        },
      });
    }

    let hashedPassword: string | undefined = undefined;
    if (dto.password) {
      hashedPassword = await this.stringUtilService.hash(dto.password);
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(dto.fullName ? { fullName: dto.fullName } : {}),
        ...(hashedPassword ? { password: hashedPassword } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
        ...(dto.dateOfBirth ? { dateOfBirth: new Date(dto.dateOfBirth) } : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
        ...(dto.citizenId !== undefined ? { citizenId: dto.citizenId } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.department ? { department: dto.department } : {}),
        ...(dto.position ? { position: dto.position } : {}),
        ...(dto.employmentType ? { employmentType: dto.employmentType } : {}),
        ...(dto.salary !== undefined ? { salary: dto.salary } : {}),
        ...(dto.hourlyRate !== undefined ? { hourlyRate: dto.hourlyRate } : {}),
        ...(dto.hireDate ? { hireDate: new Date(dto.hireDate) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.assignedOrderScope ? { assignedOrderScope: dto.assignedOrderScope } : {}),
        ...(dto.permissions !== undefined
          ? {
              permissions:
                dto.permissions === null
                  ? Prisma.JsonNull
                  : (dto.permissions as any),
            }
          : {}),
      },
    });

    const { password: _p, ...safeEmployee } = updated;
    return safeEmployee;
  }

  async updateStatus(id: string, status: 'active' | 'inactive') {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên');
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        employeeCode: true,
        fullName: true,
        email: true,
        status: true,
      },
    });

    return updated;
  }

  async deleteEmployee(id: string) {
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException('Không tìm thấy thông tin nhân viên');
    }

    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Đã xóa nhân viên thành công' };
  }

  async getSalaryHistory(employeeId: string) {
    return this.prisma.employeeSalaryHistory.findMany({
      where: { employeeId },
      orderBy: { effectiveDate: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async getEmployeeProfile(employeeId: string) {
    return this.getEmployeeById(employeeId);
  }

  async updateEmployeeProfile(employeeId: string, data: { phone?: string; address?: string; avatarUrl?: string }) {
    const updated = await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
    });
    const { password: _p, ...safeEmployee } = updated;
    return safeEmployee;
  }
}
