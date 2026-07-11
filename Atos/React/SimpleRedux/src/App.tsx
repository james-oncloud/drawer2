import { Provider } from 'react-redux';
import { store } from './store';
import { StatsPanel } from './components/StatsPanel';
import { DepartmentFilterBar } from './features/employees/DepartmentFilterBar';
import { EmployeeDetail } from './features/employees/EmployeeDetail';
import { EmployeeForm } from './features/employees/EmployeeForm';
import { EmployeeList } from './features/employees/EmployeeList';
import './App.css';

function EmployeeDirectory() {
  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Employee Directory</h1>
          <p className="subtitle">
            Simple Redux Toolkit demo — Employee state, actions &amp; selectors
          </p>
        </div>
      </header>

      <StatsPanel />

      <div className="layout">
        <section className="panel">
          <DepartmentFilterBar />
          <EmployeeList />
        </section>

        <section className="panel">
          <EmployeeDetail />
          <EmployeeForm />
        </section>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <EmployeeDirectory />
    </Provider>
  );
}
