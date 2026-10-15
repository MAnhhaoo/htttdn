/**
 * Employee Payrolls generator.
 * Creates comprehensive payroll records for all employees across recent months
 * ensuring high fidelity data for both Admin Payroll view and Employee Payslips view.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedEmployee } from './employees.generator';

export interface GeneratedPayroll {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  employmentType: 'full_time' | 'part_time';
  baseSalary: number;
  hourlyRate: number | null;
  totalHours: number | null;
  allowances: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid';
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function generatePayrolls(employees: GeneratedEmployee[]) {
  const payrolls: GeneratedPayroll[] = [];

  // Periods: 2025 (months 10, 11, 12) + 2026 (months 1 through 10)
  const pastPeriods = [
    { month: 10, year: 2025 },
    { month: 11, year: 2025 },
    { month: 12, year: 2025 },
    { month: 1, year: 2026 },
    { month: 2, year: 2026 },
    { month: 3, year: 2026 },
    { month: 4, year: 2026 },
    { month: 5, year: 2026 },
    { month: 6, year: 2026 },
    { month: 7, year: 2026 },
    { month: 8, year: 2026 },
    { month: 9, year: 2026 },
  ];

  const BANK_NAMES = ['Vietcombank', 'BIDV', 'Techcombank', 'MB Bank', 'ACB', 'VPBank'];

  employees.forEach((emp, empIdx) => {
    const isPartTime = (emp as any).employmentType === 'part_time';
    const baseSal = isPartTime ? 0 : (emp.salary || 12000000);
    const hourlyRate = isPartTime ? (emp.hourlyRate || 50000) : null;

    // 1. Generate past months (all paid on the 5th of the following month)
    for (const p of pastPeriods) {
      const allowances = isPartTime ? 500000 : faker.helpers.arrayElement([1000000, 1200000, 1500000, 2000000]);
      const deductions = faker.helpers.arrayElement([0, 200000, 350000, 500000]);
      const bonus = faker.helpers.arrayElement([500000, 1000000, 1500000, 2000000]);
      const totalHours = isPartTime ? faker.number.int({ min: 140, max: 180 }) : 0;

      const earnedSalary = isPartTime ? (totalHours * Number(hourlyRate)) : baseSal;
      const netSalary = Math.max(0, earnedSalary + allowances + bonus - deductions);

      const nextMonth = p.month === 12 ? 1 : p.month + 1;
      const nextYear = p.month === 12 ? p.year + 1 : p.year;
      const paidDate = new Date(nextYear, nextMonth - 1, 5, 9, 30, 0);
      const recordCreated = new Date(p.year, p.month - 1, 28, 17, 0, 0);

      const bank = BANK_NAMES[empIdx % BANK_NAMES.length];
      const note = `Đã quyết toán chuyển khoản qua ngân hàng ${bank}`;

      payrolls.push({
        id: faker.string.uuid(),
        employeeId: emp.id,
        month: p.month,
        year: p.year,
        employmentType: isPartTime ? 'part_time' : 'full_time',
        baseSalary: baseSal,
        hourlyRate,
        totalHours: isPartTime ? totalHours : null,
        allowances,
        deductions,
        bonus,
        netSalary,
        status: 'paid',
        paidAt: paidDate,
        notes: note,
        createdAt: recordCreated,
        updatedAt: paidDate,
      });
    }

    // 2. Current Month: 10/2026 (Realistic distribution of paid, approved, draft)
    const allowances = isPartTime ? 500000 : faker.helpers.arrayElement([1000000, 1200000, 1500000, 2000000]);
    const deductions = faker.helpers.arrayElement([0, 200000, 350000, 500000]);
    const bonus = faker.helpers.arrayElement([500000, 1000000, 1500000, 2500000]);
    const totalHours = isPartTime ? faker.number.int({ min: 140, max: 180 }) : 0;
    const earnedSalary = isPartTime ? (totalHours * Number(hourlyRate)) : baseSal;
    const netSalary = Math.max(0, earnedSalary + allowances + bonus - deductions);

    let status: 'draft' | 'approved' | 'paid' = 'approved';
    let paidDate: Date | null = null;
    let note = 'Bảng lương tháng 10/2026 đã được phê duyệt, chuẩn bị giải ngân';

    if (empIdx % 3 === 0) {
      status = 'paid';
      paidDate = new Date(2026, 9, 10, 10, 15, 0);
      const bank = BANK_NAMES[empIdx % BANK_NAMES.length];
      note = `Đã quyết toán chuyển khoản qua ngân hàng ${bank}`;
    } else if (empIdx % 3 === 2) {
      status = 'draft';
      paidDate = null;
      note = 'Bản nháp bảng lương tháng 10/2026 chờ Kế toán trưởng duyệt';
    }

    const recordCreated = new Date(2026, 9, 1, 9, 0, 0);

    payrolls.push({
      id: faker.string.uuid(),
      employeeId: emp.id,
      month: 10,
      year: 2026,
      employmentType: isPartTime ? 'part_time' : 'full_time',
      baseSalary: baseSal,
      hourlyRate,
      totalHours: isPartTime ? totalHours : null,
      allowances,
      deductions,
      bonus,
      netSalary,
      status,
      paidAt: paidDate,
      notes: note,
      createdAt: recordCreated,
      updatedAt: paidDate || recordCreated,
    });
  });

  const sql = payrolls.length > 0
    ? sqlSection('Employee Payrolls', payrolls.length) + buildInsert('EmployeePayroll', payrolls)
    : '';

  return { data: payrolls, sql };
}
