import { useEffect, useState } from 'react';

type TimerDisplayProps = {
  intervalMs?: number;
};

export function TimerDisplay({ intervalMs = 1000 }: TimerDisplayProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);

  return <p aria-live="polite">Elapsed: {seconds}s</p>;
}
