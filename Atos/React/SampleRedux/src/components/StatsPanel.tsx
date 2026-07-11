import { useAppSelector } from '../store/hooks';
import { selectTaskStats } from '../features/tasks/tasksSelectors';

export function StatsPanel() {
  const stats = useAppSelector(selectTaskStats);
  const selectedProject = useAppSelector((state) =>
    state.projects.items.find((p) => p.id === state.projects.selectedId),
  );

  return (
    <section className="stats-panel">
      <h2>{selectedProject ? selectedProject.name : 'All projects'}</h2>
      <div className="stats-grid">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="To do" value={stats.byStatus.todo} accent="#94a3b8" />
        <StatCard label="In progress" value={stats.byStatus.in_progress} accent="#6366f1" />
        <StatCard label="Done" value={stats.byStatus.done} accent="#10b981" />
        <StatCard label="Overdue" value={stats.overdue} accent="#ef4444" />
        <StatCard label="High priority open" value={stats.highPriorityOpen} accent="#f59e0b" />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  accent = '#64748b',
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="stat-card" style={{ borderTopColor: accent }}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
