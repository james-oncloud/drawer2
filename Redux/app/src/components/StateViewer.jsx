import { useSelector } from 'react-redux'

export default function StateViewer() {
  const state = useSelector((state) => state)

  return (
    <section className="card">
      <h2>Store state</h2>
      <p>Live snapshot from the single Redux store:</p>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </section>
  )
}
