import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { advanceTaskStatus, patchTask, removeTask } from './tasksSlice';
import { selectProjectById } from './tasksSelectors';
import type { Task, TaskPriority, TaskStatus } from '../../types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => selectProjectById(state, task.projectId));
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    task.dueDate < new Date().toISOString().slice(0, 10);

  return (
    <article className={`task-item priority-${task.priority} ${isOverdue ? 'overdue' : ''}`}>
      <header className="task-header">
        <h4>{task.title}</h4>
        <div className="task-badges">
          <span className={`badge status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
          <span className={`badge priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </header>

      {task.description && <p className="task-desc">{task.description}</p>}

      <footer className="task-footer">
        <span className="task-meta">
          {project && (
            <>
              <span className="project-dot" style={{ background: project.color }} />
              {project.name}
            </>
          )}
          {task.dueDate && (
            <span className={isOverdue ? 'due overdue-text' : 'due'}>
              Due {task.dueDate}
            </span>
          )}
        </span>

        <div className="task-actions">
          <select
            value={task.status}
            onChange={(e) =>
              dispatch(patchTask({ id: task.id, status: e.target.value as TaskStatus }))
            }
            aria-label={`Change status for ${task.title}`}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>

          <button
            type="button"
            className="btn-ghost"
            onClick={() => dispatch(advanceTaskStatus(task.id))}
            disabled={task.status === 'done'}
          >
            Advance
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={() => dispatch(removeTask(task.id))}
          >
            Delete
          </button>
        </div>
      </footer>
    </article>
  );
}
