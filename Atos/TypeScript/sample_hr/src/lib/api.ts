import type { CreateEmployeeInput, Employee, Result, UpdateEmployeeInput } from '../types/hr';
import { createId } from './employees';

/** Simulated latency so async/await patterns look realistic. */
function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic async helper — callers specify the success payload type `T`.
 * In a real app this would wrap `fetch`.
 */
export async function apiOk<T>(data: T): Promise<Result<T>> {
  await delay();
  return { ok: true, data };
}

export async function createEmployee(
  input: CreateEmployeeInput,
): Promise<Result<Employee>> {
  await delay();

  if (!input.email.includes('@')) {
    return { ok: false, error: 'Email must contain @' };
  }

  const employee: Employee = {
    id: createId(),
    status: input.status ?? 'active',
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim().toLowerCase(),
    department: input.department,
    title: input.title.trim(),
    startDate: input.startDate,
    ...(input.managerId ? { managerId: input.managerId } : {}),
  };

  return { ok: true, data: employee };
}

export async function updateEmployee(
  employees: readonly Employee[],
  input: UpdateEmployeeInput,
): Promise<Result<Employee>> {
  await delay();

  const existing = employees.find((e) => e.id === input.id);
  if (!existing) {
    return { ok: false, error: `Employee ${input.id} not found` };
  }

  const { id: _id, ...patch } = input;
  const updated: Employee = { ...existing, ...patch };
  return { ok: true, data: updated };
}

export async function removeEmployee(
  employees: readonly Employee[],
  id: string,
): Promise<Result<{ id: string }>> {
  await delay();
  const exists = employees.some((e) => e.id === id);
  if (!exists) {
    return { ok: false, error: `Employee ${id} not found` };
  }
  return { ok: true, data: { id } };
}
