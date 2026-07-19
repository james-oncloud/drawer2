import type { ChangeEvent } from 'react';
import type { Department, EmploymentStatus } from '../types/hr';
import { DEPARTMENTS, EMPLOYMENT_STATUSES, STATUS_LABELS } from '../types/hr';
import type { EmployeeFilters } from '../hooks/useEmployees';

type FilterBarProps = {
  filters: EmployeeFilters;
  onChange: (next: EmployeeFilters) => void;
};

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const update =
    <K extends keyof EmployeeFilters>(key: K) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      onChange({ ...filters, [key]: event.target.value as EmployeeFilters[K] });
    };

  return (
    <div className="filters">
      <label className="field">
        <span>Search</span>
        <input
          type="search"
          placeholder="Name, email, or title"
          value={filters.query}
          onChange={update('query')}
        />
      </label>

      <label className="field">
        <span>Department</span>
        <select value={filters.department} onChange={update('department')}>
          <option value="all">All</option>
          {(Object.values(DEPARTMENTS) as Department[]).map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select value={filters.status} onChange={update('status')}>
          <option value="all">All</option>
          {EMPLOYMENT_STATUSES.map((status: EmploymentStatus) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
