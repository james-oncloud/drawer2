/**
 * Domain types for the HR sample app.
 * Prefer `as const` objects + derived unions over TypeScript `enum`
 * (enums are disallowed under `erasableSyntaxOnly` / modern idiomatic TS).
 */

/** Const object — values exist at runtime; type is derived below. */
export const DEPARTMENTS = {
  Engineering: 'Engineering',
  People: 'People',
  Finance: 'Finance',
  Product: 'Product',
} as const;

/** Union of department name literals: "Engineering" | "People" | ... */
export type Department = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];

export const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'terminated'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const LEAVE_TYPES = ['annual', 'sick', 'unpaid'] as const;
export type LeaveType = (typeof LEAVE_TYPES)[number];

export const LEAVE_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type LeaveStatus = (typeof LEAVE_STATUSES)[number];

/** Object shape contract — extendable with `extends`. */
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  title: string;
  status: EmploymentStatus;
  startDate: string;
  managerId?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  status: LeaveStatus;
  startDate: string;
  endDate: string;
  reason: string;
}

/** Payload for creating an employee — omit server-generated fields. */
export type CreateEmployeeInput = Omit<Employee, 'id' | 'status'> & {
  status?: EmploymentStatus;
};

/** Partial update — only send fields you change. */
export type UpdateEmployeeInput = Partial<Omit<Employee, 'id'>> & {
  id: string;
};

/** Compact row for list UIs. */
export type EmployeePreview = Pick<
  Employee,
  'id' | 'firstName' | 'lastName' | 'department' | 'status' | 'title'
>;

/** Lookup tables keyed by department / status. */
export type EmployeesByDepartment = Record<Department, Employee[]>;
export type StatusLabelMap = Record<EmploymentStatus, string>;

/**
 * Discriminated union — narrow with `result.ok`.
 * Prefer this over throwing for expected failures.
 */
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

/** Intersection — combine reusable shapes. */
type Timestamped = { createdAt: string; updatedAt: string };
export type AuditedEmployee = Employee & Timestamped;

/** Template literal type — typed event / route names. */
export type HrEventName = 'employee' | 'leave';
export type HrHandlerName = `on${Capitalize<HrEventName>}Change`;
// "onEmployeeChange" | "onLeaveChange"

/** Mapped type — every Employee field becomes optional + nullable for drafts. */
export type EmployeeDraft = {
  [K in keyof Employee]?: Employee[K] | null;
};

export const STATUS_LABELS = {
  active: 'Active',
  on_leave: 'On leave',
  terminated: 'Terminated',
} as const satisfies StatusLabelMap;
