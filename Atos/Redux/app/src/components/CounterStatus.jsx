import { useSelector } from 'react-redux'

export default function CounterStatus() {
  const count = useSelector((state) => state.counter.value)

  let message = 'Zero'
  if (count > 0) message = 'Positive'
  if (count < 0) message = 'Negative'

  return (
    <section className="card">
      <h2>Counter status</h2>
      <p>
        This component reads the same Redux state without any props passed from{' '}
        <code>Counter</code>.
      </p>
      <p className="status">
        Current value: <strong>{count}</strong> ({message})
      </p>
    </section>
  )
}
