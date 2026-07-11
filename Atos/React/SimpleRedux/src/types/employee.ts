export type Department = 'engineering' | 'design' | 'hr' | 'sales';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: Department;
  role: string;
  salary: number;
  isActive: boolean;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  department: Department;
  role: string;
  salary: number;
}

export interface UpdateEmployeePayload {
  id: string;
  name?: string;
  email?: string;
  department?: Department;
  role?: string;
  salary?: number;
  isActive?: boolean;
}

export type DepartmentFilter = Department | 'all';
