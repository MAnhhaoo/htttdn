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
      let lateSummaryNote = '';

      // Fetch attendance hours for the month
      const attendances = await this.prisma.employeeAttendance.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const recordedHours = attendances.reduce(
        (sum, a) => sum + Number(a.hoursWorked || 0),
        0,
      );

      if (isFullTime) {
        baseSalary = Number(emp.salary || 0);
        const hourlyEquivalent = baseSalary > 0 ? (baseSalary / 26) / 8 : 0;

        let totalMissingHours = 0;
        for (const att of attendances) {
          const worked = Number(att.hoursWorked || 0);
          if (att.status === 'late' || worked < 8) {
            const missing = Math.max(0, 8 - worked);
            totalMissingHours += missing;
          }
        }

        if (totalMissingHours > 0 && hourlyEquivalent > 0) {
          const lateDeduction = Math.round(totalMissingHours * hourlyEquivalent);
          deductions += lateDeduction;
          lateSummaryNote = ` (Trừ ${totalMissingHours.toFixed(1)}h đi trễ/thiếu giờ: -${lateDeduction.toLocaleString('vi-VN')} đ)`;
        }

        totalHours = recordedHours > 0 ? recordedHours : 208;
        netSalary = Math.max(0, baseSalary + allowances - deductions + bonus);
      } else {
        hourlyRate = Number(emp.hourlyRate || 35000);
        totalHours = recordedHours > 0 ? recordedHours : 88;
        netSalary = Math.round(totalHours * hourlyRate) + allowances - deductions + bonus;
      }

      const notes = `Bảng tính lương tháng ${month}/${year}${lateSummaryNote}`;

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
          notes,
        },
        update: {
          baseSalary,
          hourlyRate,
          totalHours,
          allowances,
          deductions,
          bonus,
          netSalary,
          notes,
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

  async recordAttendance(dto: RecordAttendanceDto & { employeeId: string }) {
    const dateObj = new Date(dto.date);

    // Get employee to check assigned schedule
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.employeeId },
      select: { permissions: true },
    });
    if (!employee) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    const perms = (employee?.permissions as Record<string, any>) || {};
    const schedule = perms.schedule || {};
    const shiftStart = dto.shiftStart || schedule.shiftStart || '08:30';
    const shiftEnd = dto.shiftEnd || schedule.shiftEnd || '16:30';
    const standardHours = Number(schedule.shiftHours || 8);

    let status = dto.status || 'present';
    let hoursWorked = dto.hoursWorked;
    let note = dto.note || null;

    if (dto.checkIn) {
      const checkInDate = new Date(dto.checkIn);
      const [startH, startM] = shiftStart.split(':').map((v) => parseInt(v, 10) || 0);
      const [endH, endM] = shiftEnd.split(':').map((v) => parseInt(v, 10) || 0);

      const scheduledStartDate = new Date(checkInDate);
      scheduledStartDate.setHours(startH, startM, 0, 0);

      const scheduledEndDate = new Date(checkInDate);
      scheduledEndDate.setHours(endH, endM, 0, 0);

      // Check if late (more than 5 mins after scheduled start)
      if (checkInDate.getTime() > scheduledStartDate.getTime() + 5 * 60 * 1000) {
        status = 'late';
        const lateMins = Math.round((checkInDate.getTime() - scheduledStartDate.getTime()) / (60 * 1000));
        const lateHours = Number((lateMins / 60).toFixed(2));

        if (hoursWorked === undefined || hoursWorked === null) {
          const remainingMs = Math.max(0, scheduledEndDate.getTime() - checkInDate.getTime());
          const calculatedHours = Number((remainingMs / (1000 * 60 * 60)).toFixed(2));
          hoursWorked = Math.min(standardHours, calculatedHours);
        }

        const reason = dto.lateReason ? ` - Lý do: ${dto.lateReason}` : '';
        const extraNote = dto.note ? ` | ${dto.note}` : '';
        note = `[Ca ${shiftStart}-${shiftEnd}] Trễ ${lateMins}p (${lateHours}h)${reason}${extraNote}`.slice(0, 500);
      } else {
        if (hoursWorked === undefined || hoursWorked === null) {
          hoursWorked = standardHours;
        }
        if (!note) {
          note = `[Ca ${shiftStart}-${shiftEnd}] Đúng giờ (${hoursWorked}h)`;
        }
      }
    } else {
      if (hoursWorked === undefined || hoursWorked === null) {
        hoursWorked = standardHours;
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
        hoursWorked,
        status: status as any,
        note,
      },
      update: {
        checkIn: dto.checkIn ? new Date(dto.checkIn) : undefined,
        checkOut: dto.checkOut ? new Date(dto.checkOut) : undefined,
        hoursWorked: hoursWorked !== undefined ? hoursWorked : undefined,
        status: status as any,
        note: note !== undefined ? note : undefined,
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
