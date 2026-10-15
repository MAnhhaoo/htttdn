import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmploymentType, PayrollStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/prisma.service';
import {
  CalculatePayrollDto,
  RecordAttendanceDto,
  UpdatePayrollItemDto,
} from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateMonthlyPayroll(dto: CalculatePayrollDto) {
    const { month, year, department } = dto;

    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      status: 'active',
      ...(department ? { department } : {}),
    };

    const employees = await this.prisma.employee.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        employeeCode: true,
        department: true,
        position: true,
        employmentType: true,
        salary: true,
        hourlyRate: true,
      },
    });

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const results: any[] = [];

    for (const emp of employees) {
      const isFullTime = emp.employmentType === EmploymentType.full_time;
      let baseSalary = 0;
      let hourlyRate: number | null = null;
      let totalHours: number | null = null;
      let allowances = isFullTime ? 500000 : 200000;
      let deductions = 0;
      let bonus = 0;
      let netSalary = 0;

      if (isFullTime) {
        baseSalary = Number(emp.salary || 0);
        netSalary = baseSalary + allowances - deductions + bonus;
      } else {
        hourlyRate = Number(emp.hourlyRate || 35000);

        // Fetch attendance hours
        const attendances = await this.prisma.employeeAttendance.findMany({
          where: {
            employeeId: emp.id,
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        let recordedHours = attendances.reduce(
          (sum, a) => sum + Number(a.hoursWorked || 0),
          0,
        );

        // If no attendance recorded yet, assign 88 hours benchmark for simulation
        if (recordedHours === 0) {
          recordedHours = 88;
        }

        totalHours = recordedHours;
        netSalary = Math.round(totalHours * hourlyRate) + allowances - deductions + bonus;
      }

      const payroll = await this.prisma.employeePayroll.upsert({
        where: {
          employeeId_month_year: {
            employeeId: emp.id,
            month,
            year,
          },
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          employmentType: emp.employmentType,
          baseSalary,
          hourlyRate,
          totalHours,
          allowances,
          deductions,
          bonus,
          netSalary,
          status: PayrollStatus.draft,
          notes: `Bảng tính lương tháng ${month}/${year}`,
        },
        update: {
          baseSalary,
          hourlyRate,
          totalHours,
          netSalary,
        },
        include: {
          employee: {
            select: {
              id: true,
              fullName: true,
              employeeCode: true,
              department: true,
              position: true,
            },
          },
        },
      });

      results.push(payroll);
    }

    return {
      message: `Đã tính toán bảng lương tháng ${month}/${year} cho ${results.length} nhân viên`,
      count: results.length,
      payrolls: results,
    };
  }

  async listPayrolls(month?: number, year?: number, department?: string, status?: string) {
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const where: Prisma.EmployeePayrollWhereInput = {
      month: targetMonth,
      year: targetYear,
      ...(status ? { status: status as PayrollStatus } : {}),
      ...(department ? { employee: { department } } : {}),
    };

    const list = await this.prisma.employeePayroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            position: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ employee: { department: 'asc' } }, { employee: { employeeCode: 'asc' } }],
    });

    const totalNetSalary = list.reduce((s, p) => s + Number(p.netSalary || 0), 0);
    const approvedCount = list.filter((p) => p.status === PayrollStatus.approved || p.status === PayrollStatus.paid).length;
    const paidCount = list.filter((p) => p.status === PayrollStatus.paid).length;

    return {
      month: targetMonth,
      year: targetYear,
      summary: {
        totalEmployees: list.length,
        totalNetSalary,
        approvedCount,
        paidCount,
      },
      list,
    };
  }

  async updatePayrollItem(id: string, dto: UpdatePayrollItemDto) {
    const existing = await this.prisma.employeePayroll.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Không tìm thấy bản ghi lương');
    }

    const allowances = dto.allowances !== undefined ? dto.allowances : Number(existing.allowances);
    const deductions = dto.deductions !== undefined ? dto.deductions : Number(existing.deductions);
    const bonus = dto.bonus !== undefined ? dto.bonus : Number(existing.bonus);

    let netSalary = 0;
    if (existing.employmentType === EmploymentType.full_time) {
      netSalary = Number(existing.baseSalary) + allowances + bonus - deductions;
    } else {
      netSalary = Math.round(Number(existing.totalHours || 0) * Number(existing.hourlyRate || 0)) + allowances + bonus - deductions;
    }

    const isPaid = dto.status === 'paid';

    const updated = await this.prisma.employeePayroll.update({
      where: { id },
      data: {
        allowances,
        deductions,
        bonus,
        netSalary,
        ...(dto.status ? { status: dto.status as PayrollStatus } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        paidAt: isPaid ? new Date() : existing.paidAt,
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
    });

    return updated;
  }

  async getMyPayrolls(employeeId: string) {
    return this.prisma.employeePayroll.findMany({
      where: { employeeId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async recordAttendance(dto: RecordAttendanceDto) {
    const dateObj = new Date(dto.date);

    let hoursWorked = dto.hoursWorked;
    if (hoursWorked === undefined && dto.checkIn && dto.checkOut) {
      const inTime = new Date(dto.checkIn).getTime();
      const outTime = new Date(dto.checkOut).getTime();
      if (outTime > inTime) {
        hoursWorked = Number(((outTime - inTime) / (1000 * 60 * 60)).toFixed(2));
      }
    }

    return this.prisma.employeeAttendance.upsert({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: dateObj,
        },
      },
      create: {
        employeeId: dto.employeeId,
        date: dateObj,
        checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : null,
        hoursWorked: hoursWorked ?? 8,
        status: dto.status as any,
        note: dto.note || null,
      },
      update: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        hoursWorked: hoursWorked !== undefined ? hoursWorked : undefined,
        status: dto.status as any,
        note: dto.note !== undefined ? dto.note : undefined,
      },
    });
  }

  async listAttendance(employeeId?: string, month?: number, year?: number) {
    const targetMonth = month ? Number(month) : new Date().getMonth() + 1;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59));

    return this.prisma.employeeAttendance.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            employeeCode: true,
            department: true,
            employmentType: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
