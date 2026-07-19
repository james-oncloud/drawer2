import type { Employee } from '../types/hr';
import { fullName } from '../lib/employees';
import { StatusBadge } from './StatusBadge';

type EmployeeCardProps = {
  employee: Employee;
  managerName?: string;
  onPromoteLeave: (id: string) => void;
  onActivate: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

export function EmployeeCard({
  employee,
  managerName,
  onPromoteLeave,
  onActivate,
  onRemove,
  disabled = false,
}: EmployeeCardProps) {
  const { id, title, department, email, status, startDate } = employee;

  return (
    <article className="employee-card">
      <header className="employee-card__header">
        <div>
          <h3>{fullName(employee)}</h3>
          <p className="muted">
            {title} · {department}
          </p>
        </div>
        <StatusBadge tone="status" status={status} />
      </header>

      <dl className="meta">
        <div>
          <dt>Email</dt>
          <dd>{email}</dd>
        </div>
        <div>
          <dt>Start date</dt>
          <dd>{startDate}</dd>
        </div>
        <div>
          <dt>Manager</dt>
          <dd>{managerName ?? '—'}</dd>
        </div>
      </dl>

      <footer className="employee-card__actions">
        {status === 'active' ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPromoteLeave(id)}
          >
            Mark on leave
          </button>
        ) : null}
        {status === 'on_leave' ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onActivate(id)}
          >
            Return to work
          </button>
        ) : null}
        <button
          type="button"
          className="danger"
          disabled={disabled}
          onClick={() => onRemove(id)}
        >
          Remove
        </button>
      </footer>
    </article>
  );
}
