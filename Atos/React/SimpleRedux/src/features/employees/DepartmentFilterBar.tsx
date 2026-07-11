import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDepartmentFilter } from './employeesSlice';
import type { DepartmentFilter } from '../../types/employee';

const departments: { value: DepartmentFilter; label: string }[] = [
  { value: 'all', label: 'All departments' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'hr', label: 'HR' },
  { value: 'sales', label: 'Sales' },
];

export function DepartmentFilterBar() {
  const dispatch = useAppDispatch();
  const currentFilter = useAppSelector((state) => state.employees.departmentFilter);

  return (
    <div className="filter-bar">
      <label htmlFor="department-filter">Filter by department</label>
      <select
        id="department-filter"
        value={currentFilter}
        onChange={(event) =>
          dispatch(setDepartmentFilter(event.target.value as DepartmentFilter))
        }
      >
        {departments.map((department) => (
          <option key={department.value} value={department.value}>
            {department.label}
          </option>
        ))}
      </select>
    </div>
  );
}
