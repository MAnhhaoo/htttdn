/**
 * Employee Attendance generator.
 * Creates daily attendance logs for employees over recent months.
 */
import { faker } from '../utils/faker';
import { buildInsert, sqlSection } from '../utils/sqlBuilder';
import type { GeneratedEmployee } from './employees.generator';

export interface GeneratedAttendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  hoursWorked: number | null;
  status: 'present' | 'absent' | 'late' | 'leave';
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function generateAttendances(employees: GeneratedEmployee[]) {
  const attendances: GeneratedAttendance[] = [];

  // Generate workdays for the last 60 days up to 2026-10-14
  const endDate = new Date('2026-10-14T00:00:00Z');
  const startDate = new Date('2026-08-15T00:00:00Z');

  const workdays: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    const dayOfWeek = curr.getUTCDay();
    // Monday (1) to Friday (5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workdays.push(new Date(curr));
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  for (const emp of employees) {
    if (emp.status !== 'active') continue;

    for (const d of workdays) {
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const day = d.getUTCDate();

      const roll = Math.random();
      let status: 'present' | 'late' | 'leave' = 'present';
      let checkIn: Date | null = null;
      let checkOut: Date | null = null;
      let hoursWorked: number | null = 8;
      let note: string | null = null;

      if (roll < 0.88) {
        // Present on time
        status = 'present';
        const inMin = faker.number.int({ min: 45, max: 59 });
        checkIn = new Date(Date.UTC(year, month, day, 7, inMin, 0));
        const outMin = faker.number.int({ min: 1, max: 30 });
        checkOut = new Date(Date.UTC(year, month, day, 17, outMin, 0));
        hoursWorked = 8 + (outMin / 60);
      } else if (roll < 0.95) {
        // Late
        status = 'late';
        const inMin = faker.number.int({ min: 15, max: 40 });
        checkIn = new Date(Date.UTC(year, month, day, 8, inMin, 0));
        checkOut = new Date(Date.UTC(year, month, day, 17, 30, 0));
        hoursWorked = 7.5;
        note = 'Đến muộn do thời tiết / giao thông';
      } else {
        // Approved leave
        status = 'leave';
        checkIn = null;
        checkOut = null;
        hoursWorked = 0;
        note = 'Nghỉ phép có đơn phê duyệt';
      }

      attendances.push({
        id: faker.string.uuid(),
        employeeId: emp.id,
        date: d,
        checkIn,
        checkOut,
        hoursWorked: hoursWorked ? Number(hoursWorked.toFixed(2)) : null,
        status,
        note,
        createdAt: d,
        updatedAt: checkOut || d,
      });
    }
  }

  const sql = attendances.length > 0
    ? sqlSection('Employee Attendances', attendances.length) + buildInsert('EmployeeAttendance', attendances)
    : '';

  return { data: attendances, sql };
}
