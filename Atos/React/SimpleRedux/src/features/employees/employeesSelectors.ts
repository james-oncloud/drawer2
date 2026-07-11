import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export const selectAllEmployees = (state: RootState) => state.employees.items;

export const selectDepartmentFilter = (state: RootState) =>
  state.employees.departmentFilter;

export const selectSelectedEmployeeId = (state: RootState) =>
  state.employees.selectedId;

export const selectFilteredEmployees = createSelector(
  [selectAllEmployees, selectDepartmentFilter],
  (employees, departmentFilter) => {
    if (departmentFilter === 'all') return employees;
    return employees.filter((employee) => employee.department === departmentFilter);
  },
);

export const selectSelectedEmployee = createSelector(
  [selectAllEmployees, selectSelectedEmployeeId],
  (employees, selectedId) =>
    employees.find((employee) => employee.id === selectedId) ?? null,
);

export const selectEmployeeStats = createSelector([selectAllEmployees], (employees) => {
  const activeCount = employees.filter((employee) => employee.isActive).length;
  const averageSalary =
    employees.length === 0
      ? 0
      : Math.round(
          employees.reduce((total, employee) => total + employee.salary, 0) /
            employees.length,
        );

  return {
    total: employees.length,
    activeCount,
    averageSalary,
  };
});
