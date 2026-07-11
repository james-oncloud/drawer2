import { Provider } from 'react-redux';
import { Counter } from './features/counter/Counter';
import { store } from './store';
import './App.css';

function AppContent() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>React Redux App</h1>
        <p className="subtitle">
          Vite + React + TypeScript + Classic Redux + Redux Thunk
        </p>
      </header>

      <main className="card">
        <h2>Counter</h2>
        <p className="hint">
          Sync actions via action creators; async via a Redux Thunk.
        </p>
        <Counter />
      </main>
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
