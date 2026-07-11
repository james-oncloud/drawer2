import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  resetFilters,
  setPriorityFilter,
  setSearch,
  setStatusFilter,
  toggleOverdueOnly,
} from './filtersSlice';
import type { PriorityFilter, StatusFilter } from '../../types';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All priorities' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function FilterBar() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  return (
    <section className="filter-bar">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        placeholder="Search tasks…"
        aria-label="Search tasks"
      />

      <select
        value={filters.status}
        onChange={(e) => dispatch(setStatusFilter(e.target.value as StatusFilter))}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(e) => dispatch(setPriorityFilter(e.target.value as PriorityFilter))}
        aria-label="Filter by priority"
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={filters.showOverdueOnly}
          onChange={() => dispatch(toggleOverdueOnly())}
        />
        Overdue only
      </label>

      <button type="button" className="btn-ghost" onClick={() => dispatch(resetFilters())}>
        Reset filters
      </button>
    </section>
  );
}
