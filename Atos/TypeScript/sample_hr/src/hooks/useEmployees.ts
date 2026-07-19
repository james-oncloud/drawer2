import { useCallback, useMemo, useState } from 'react';
import type {
  CreateEmployeeInput,
  Department,
  Employee,
  EmploymentStatus,
  UpdateEmployeeInput,
} from '../types/hr';
import { INITIAL_EMPLOYEES } from '../data/seed';
import { createEmployee, removeEmployee, updateEmployee } from '../lib/api';
import { filterEmployees } from '../lib/employees';
import { useLocalStorage } from './useLocalStorage';

export type EmployeeFilters = {
  query: string;
  department: Department | 'all';
  status: EmploymentStatus | 'all';
};

const DEFAULT_FILTERS: EmployeeFilters = {
  query: '',
  department: 'all',
  status: 'all',
};

export function useEmployees() {
  const [employees, setEmployees] = useLocalStorage<Employee[]>(
    'sample-hr.employees',
    INITIAL_EMPLOYEES,
  );
  const [filters, setFilters] = useState<EmployeeFilters>(DEFAULT_FILTERS);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const visible = useMemo(
    () => filterEmployees(employees, filters),
    [employees, filters],
  );

  const add = useCallback(async (input: CreateEmployeeInput) => {
    setBusy(true);
    setMessage(null);
    const result = await createEmployee(input);
    setBusy(false);

    if (!result.ok) {
      setMessage(result.error);
      return result;
    }

    setEmployees((prev) => [...prev, result.data]);
    setMessage(`Added ${result.data.firstName} ${result.data.lastName}`);
    return result;
  }, [setEmployees]);

  const patch = useCallback(
    async (input: UpdateEmployeeInput) => {
      setBusy(true);
      setMessage(null);
      const result = await updateEmployee(employees, input);
      setBusy(false);

      if (!result.ok) {
        setMessage(result.error);
        return result;
      }

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === result.data.id ? result.data : employee,
        ),
      );
      setMessage('Employee updated');
      return result;
    },
    [employees, setEmployees],
  );

  const remove = useCallback(
    async (id: string) => {
      setBusy(true);
      setMessage(null);
      const result = await removeEmployee(employees, id);
      setBusy(false);

      if (!result.ok) {
        setMessage(result.error);
        return result;
      }

      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
      setMessage('Employee removed');
      return result;
    },
    [employees, setEmployees],
  );

  const reset = useCallback(() => {
    setEmployees(INITIAL_EMPLOYEES);
    setFilters(DEFAULT_FILTERS);
    setMessage('Reset to seed data');
  }, [setEmployees]);

  return {
    employees,
    visible,
    filters,
    setFilters,
    busy,
    message,
    add,
    patch,
    remove,
    reset,
  } as const;
}

export type UseEmployeesReturn = ReturnType<typeof useEmployees>;
