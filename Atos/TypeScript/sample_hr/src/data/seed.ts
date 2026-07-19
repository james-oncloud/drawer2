import type { Employee } from '../types/hr';
import { DEPARTMENTS } from '../types/hr';

/**
 * `satisfies` checks the value against Employee[] without widening
 * department / status literals to plain `string`.
 */
export const SEED_EMPLOYEES = [
  {
    id: 'e-1001',
    firstName: 'Amina',
    lastName: 'Hassan',
    email: 'amina.hassan@example.com',
    department: DEPARTMENTS.Engineering,
    title: 'Staff Engineer',
    status: 'active',
    startDate: '2021-03-15',
  },
  {
    id: 'e-1002',
    firstName: 'Leo',
    lastName: 'Nguyen',
    email: 'leo.nguyen@example.com',
    department: DEPARTMENTS.Product,
    title: 'Product Manager',
    status: 'active',
    startDate: '2022-07-01',
    managerId: 'e-1001',
  },
  {
    id: 'e-1003',
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.martinez@example.com',
    department: DEPARTMENTS.People,
    title: 'HR Business Partner',
    status: 'on_leave',
    startDate: '2019-11-20',
  },
  {
    id: 'e-1004',
    firstName: 'Jonah',
    lastName: 'Clarke',
    email: 'jonah.clarke@example.com',
    department: DEPARTMENTS.Finance,
    title: 'Financial Analyst',
    status: 'active',
    startDate: '2023-01-09',
  },
  {
    id: 'e-1005',
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya.shah@example.com',
    department: DEPARTMENTS.Engineering,
    title: 'Frontend Engineer',
    status: 'terminated',
    startDate: '2020-05-12',
    managerId: 'e-1001',
  },
] as const satisfies readonly Employee[];

export const INITIAL_EMPLOYEES: Employee[] = SEED_EMPLOYEES.map((employee) => ({
  ...employee,
}));
