import type { EmploymentStatus } from '../types/hr';
import { STATUS_LABELS } from '../types/hr';
import { assertNever } from '../lib/assertNever';

/**
 * Discriminated union props — `tone` narrows available fields.
 * Error alerts require an optional retry callback.
 */
type StatusBadgeProps =
  | { tone: 'status'; status: EmploymentStatus }
  | { tone: 'info'; label: string }
  | { tone: 'error'; label: string; onRetry?: () => void };

export function StatusBadge(props: StatusBadgeProps) {
  switch (props.tone) {
    case 'status':
      return (
        <span className={`badge badge--${props.status}`}>
          {STATUS_LABELS[props.status]}
        </span>
      );
    case 'info':
      return <span className="badge badge--info">{props.label}</span>;
    case 'error':
      return (
        <span className="badge badge--error">
          {props.label}
          {props.onRetry ? (
            <button type="button" className="link-button" onClick={props.onRetry}>
              Retry
            </button>
          ) : null}
        </span>
      );
    default:
      return assertNever(props);
  }
}
