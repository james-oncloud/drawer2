import type { Employee, EmploymentStatus, Result } from '../types/hr';
import { DEPARTMENTS, EMPLOYMENT_STATUSES } from '../types/hr';

/** Custom type guard — narrows `unknown` to `Employee`. */
export function isEmployee(value: unknown): value is Employee {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Record<string, unknown>;
  const departmentValues = Object.values(DEPARTMENTS);

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.firstName === 'string' &&
    typeof candidate.lastName === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.startDate === 'string' &&
    typeof candidate.department === 'string' &&
    departmentValues.includes(
      candidate.department as (typeof departmentValues)[number],
    ) &&
    typeof candidate.status === 'string' &&
    (EMPLOYMENT_STATUSES as readonly string[]).includes(candidate.status)
  );
}

export function isEmploymentStatus(value: string): value is EmploymentStatus {
  return (EMPLOYMENT_STATUSES as readonly string[]).includes(value);
}

/** Parse JSON safely into a typed Result without using `any`. */
export function parseEmployeesJson(text: string): Result<Employee[]> {
  try {
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'Expected an array of employees' };
    }

    const employees: Employee[] = [];
    for (const item of parsed) {
      if (!isEmployee(item)) {
        return { ok: false, error: 'Invalid employee shape in data' };
      }
      employees.push(item);
    }

    return { ok: true, data: employees };
  } catch {
    return { ok: false, error: 'Invalid JSON' };
  }
}
