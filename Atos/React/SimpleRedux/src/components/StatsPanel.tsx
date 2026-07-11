import { useAppSelector } from '../store/hooks';
import { selectEmployeeStats } from '../features/employees/employeesSelectors';

export function StatsPanel() {
  const stats = useAppSelector(selectEmployeeStats);

  return (
    <div className="stats-panel">
      <div className="stat">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total employees</span>
      </div>
      <div className="stat">
        <span className="stat-value">{stats.activeCount}</span>
        <span className="stat-label">Active</span>
      </div>
      <div className="stat">
        <span className="stat-value">£{stats.averageSalary.toLocaleString()}</span>
        <span className="stat-label">Average salary</span>
      </div>
    </div>
  );
}
