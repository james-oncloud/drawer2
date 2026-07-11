import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBox } from '../../components/SearchBox';
import { TimerDisplay } from '../../components/TimerDisplay';

describe('8. Fake timers (vi.useFakeTimers)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fast-forwards debounced search', () => {
    const onSearch = vi.fn();

    render(<SearchBox onSearch={onSearch} />);

    fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
      target: { value: 'rtl' },
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenLastCalledWith('rtl');
  });

  it('advances setInterval for polling UIs', async () => {
    render(<TimerDisplay intervalMs={1000} />);

    expect(screen.getByText(/elapsed: 0s/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(screen.getByText(/elapsed: 3s/i)).toBeInTheDocument();
  });
});
