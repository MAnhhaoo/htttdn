/**
 * Employee Salary History generator.
 * Creates trackable promotion and salary increment records for employees.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedEmployee } from './employees.generator';
import type { GeneratedAdmin } from './users.generator';

export interface GeneratedSalaryHistory {
  id: string;
  employeeId: string;
  oldSalary: number | null;
  newSalary: number;
  oldHourlyRate: number | null;
  newHourlyRate: number | null;
  employmentType: 'full_time' | 'part_time';
  effectiveDate: Date;
  reason: string | null;
  adminId: string | null;
  createdAt: Date;
}

export function generateSalaryHistories(
  employees: GeneratedEmployee[],
  admins: GeneratedAdmin[],
) {
  const histories: GeneratedSalaryHistory[] = [];
  const adminId = admins[0]?.id || null;

  for (const emp of employees) {
    const isPartTime = (emp as any).employmentType === 'part_time';
    const currentSal = emp.salary;
    const oldSal = Math.round(currentSal * 0.88); // 12% lower initially

    const effectiveDate = new Date(emp.hireDate.getTime() + 86400000 * 180); // 6 months after hire
    const reasons = [
      'Đánh giá hiệu suất định kỳ 6 tháng đạt xuất sắc',
      'Thăng cấp chuyên môn và tăng lương bậc 2',
      'Điều chỉnh lương theo quy chế tài chính MIVA năm 2025',
      'Khen thưởng hoàn thành xuất sắc chỉ tiêu vận hành đơn hàng',
    ];

    histories.push({
      id: faker.string.uuid(),
      employeeId: emp.id,
      oldSalary: isPartTime ? null : oldSal,
      newSalary: currentSal,
      oldHourlyRate: isPartTime ? 45000 : null,
      newHourlyRate: isPartTime ? 50000 : null,
      employmentType: isPartTime ? 'part_time' : 'full_time',
      effectiveDate,
      reason: faker.helpers.arrayElement(reasons),
      adminId,
      createdAt: effectiveDate,
    });
  }

  const sql = histories.length > 0
    ? sqlSection('Employee Salary Histories', histories.length) + buildInsert('EmployeeSalaryHistory', histories)
    : '';

  return { data: histories, sql };
}
