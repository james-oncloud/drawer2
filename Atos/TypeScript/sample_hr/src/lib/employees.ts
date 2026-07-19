import type { Department, Employee, EmployeesByDepartment } from '../types/hr';
import { DEPARTMENTS } from '../types/hr';
import { assertNever } from './assertNever';

export function fullName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName} ${employee.lastName}`;
}

export function formatStatusLabel(status: Employee['status']): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'on_leave':
      return 'On leave';
    case 'terminated':
      return 'Terminated';
    default:
      return assertNever(status);
  }
}

export function groupByDepartment(employees: readonly Employee[]): EmployeesByDepartment {
  const empty = Object.fromEntries(
    Object.values(DEPARTMENTS).map((dept) => [dept, [] as Employee[]]),
  ) as EmployeesByDepartment;

  return employees.reduce<EmployeesByDepartment>((acc, employee) => {
    acc[employee.department] = [...acc[employee.department], employee];
    return acc;
  }, empty);
}

export function countByStatus(
  employees: readonly Employee[],
): Record<Employee['status'], number> {
  return employees.reduce(
    (acc, { status }) => {
      acc[status] += 1;
      return acc;
    },
    { active: 0, on_leave: 0, terminated: 0 },
  );
}

export function filterEmployees(
  employees: readonly Employee[],
  options: {
    query?: string;
    department?: Department | 'all';
    status?: Employee['status'] | 'all';
  },
): Employee[] {
  const query = options.query?.trim().toLowerCase() ?? '';
  const department = options.department ?? 'all';
  const status = options.status ?? 'all';

  return employees.filter((employee) => {
    const matchesQuery =
      query.length === 0 ||
      fullName(employee).toLowerCase().includes(query) ||
      employee.email.toLowerCase().includes(query) ||
      employee.title.toLowerCase().includes(query);

    const matchesDepartment =
      department === 'all' || employee.department === department;

    const matchesStatus = status === 'all' || employee.status === status;

    return matchesQuery && matchesDepartment && matchesStatus;
  });
}

export function createId(): string {
  return crypto.randomUUID();
}
