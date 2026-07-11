import { ExpensiveChart } from './ExpensiveChart';

type DashboardProps = {
  metrics: number[];
};

export function Dashboard({ metrics }: DashboardProps) {
  return (
    <section aria-label="Dashboard">
      <h2>Metrics</h2>
      <ExpensiveChart data={metrics} />
    </section>
  );
}
