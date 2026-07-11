import { useAppSelector } from '../../store/hooks';
import { selectFilteredTasks, selectIsLoading } from './tasksSelectors';
import { TaskItem } from './TaskItem';

export function TaskList() {
  const tasks = useAppSelector(selectFilteredTasks);
  const isLoading = useAppSelector(selectIsLoading);
  const tasksStatus = useAppSelector((state) => state.tasks.status);

  if (tasksStatus === 'loading') {
    return <p className="muted">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return (
      <p className="empty-state">
        {isLoading ? 'Updating…' : 'No tasks match the current filters.'}
      </p>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ul>
  );
}
