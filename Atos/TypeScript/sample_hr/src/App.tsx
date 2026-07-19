import { EmployeeCard } from './components/EmployeeCard';
import { EmployeeForm } from './components/EmployeeForm';
import { FilterBar } from './components/FilterBar';
import { List } from './components/List';
import { Sample } from './components/Sample';
import { StatsPanel } from './components/StatsPanel';
import { StatusBadge } from './components/StatusBadge';
import { useEmployees } from './hooks/useEmployees';
import { fullName } from './lib/employees';
import type { Employee } from './types/hr';

function App() {
  const {
    employees,
    visible,
    filters,
    setFilters,
    busy,
    message,
    add,
    patch,
    remove,
    reset,
  } = useEmployees();

  const managerName = (employee: Employee): string | undefined => {
    if (!employee.managerId) return undefined;
    const manager = employees.find((item) => item.id === employee.managerId);
    return manager ? fullName(manager) : undefined;
  };

  return (
    <div className="app">
      <Sample />
      <header className="hero">
        <p className="eyebrow">sample_hr</p>
        <h1>People directory</h1>
        <p className="lede">
          A small HR app written in idiomatic TypeScript — types, unions,
          generics, guards, and utility types you can learn from the source.
        </p>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <StatsPanel employees={employees} />
          <EmployeeForm onSubmit={add} disabled={busy} />
          <button type="button" className="ghost" onClick={reset} disabled={busy}>
            Reset seed data
          </button>
        </aside>

        <main className="main">
          <div className="main__toolbar">
            <FilterBar filters={filters} onChange={setFilters} />
            {message ? <StatusBadge tone="info" label={message} /> : null}
          </div>

          <List
            items={visible}
            keyExtractor={(employee) => employee.id}
            emptyMessage="No employees match these filters"
            renderItem={(employee) => (
              <EmployeeCard
                employee={employee}
                managerName={managerName(employee)}
                disabled={busy}
                onPromoteLeave={(id) => void patch({ id, status: 'on_leave' })}
                onActivate={(id) => void patch({ id, status: 'active' })}
                onRemove={(id) => void remove(id)}
              />
            )}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
