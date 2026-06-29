import Counter from './components/Counter'
import CounterStatus from './components/CounterStatus'
import StateViewer from './components/StateViewer'

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>Redux Demo</h1>
        <p>
          Click the buttons to <strong>dispatch actions</strong>. The reducer
          updates the store; every connected component re-renders.
        </p>
      </header>

      <main>
        <Counter />
        <CounterStatus />
        <StateViewer />
      </main>
    </div>
  )
}
