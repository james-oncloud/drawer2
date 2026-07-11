import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { fetchProjects } from './features/projects/projectsSlice';
import { fetchTasks } from './features/tasks/tasksSlice';
import { ProjectSidebar } from './features/projects/ProjectSidebar';
import { FilterBar } from './features/filters/FilterBar';
import { TaskForm } from './features/tasks/TaskForm';
import { TaskList } from './features/tasks/TaskList';
import { StatsPanel } from './components/StatsPanel';
import { NotificationToast } from './features/notifications/NotificationToast';
import './App.css';

function TaskBoard() {
  useEffect(() => {
    store.dispatch(fetchProjects());
    store.dispatch(fetchTasks());
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Project Task Board</h1>
          <p className="subtitle">
            Redux Toolkit demo — slices, reducers, async thunks &amp; dispatch
          </p>
        </div>
      </header>

      <div className="layout">
        <ProjectSidebar />

        <main className="main-panel">
          <StatsPanel />
          <FilterBar />
          <TaskForm />
          <TaskList />
        </main>
      </div>

      <NotificationToast />
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <TaskBoard />
    </Provider>
  );
}
