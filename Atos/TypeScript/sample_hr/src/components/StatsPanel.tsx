import type { Employee } from '../types/hr';
import { countByStatus, groupByDepartment } from '../lib/employees';
import { DEPARTMENTS, STATUS_LABELS } from '../types/hr';

type StatsPanelProps = {
  employees: readonly Employee[];
};

export function StatsPanel({ employees }: StatsPanelProps) {
  const byStatus = countByStatus(employees);
  const byDepartment = groupByDepartment(employees);

  return (
    <section className="stats" aria-label="Workforce summary">
      <h2>Summary</h2>
      <p className="muted">
        {employees.length} employee{employees.length === 1 ? '' : 's'} in directory
      </p>

      <div className="stats__grid">
        <div>
          <h3>By status</h3>
          <ul>
            {(Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>).map(
              (status) => (
                <li key={status}>
                  <span>{STATUS_LABELS[status]}</span>
                  <strong>{byStatus[status]}</strong>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h3>By department</h3>
          <ul>
            {Object.values(DEPARTMENTS).map((department) => (
              <li key={department}>
                <span>{department}</span>
                <strong>{byDepartment[department].length}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
