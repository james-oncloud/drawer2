import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBox } from '../../components/SearchBox';

describe('1. Mock functions (vi.fn)', () => {
  
  it('tracks callback invocations from user interaction', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBox onSearch={onSearch} />);

    await user.type(screen.getByRole('textbox', { name: /search/i }), 'react');

    await waitFor(() => expect(onSearch).toHaveBeenCalled());
  });

  it('asserts call arguments with toHaveBeenCalledWith', async () => {
    const onSearch = vi.fn();

    render(<SearchBox onSearch={onSearch} />);

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith(''));
  });

  it('uses mockReturnValue and mockImplementation', () => {
    const format = vi.fn().mockImplementation((s: string) => s.trim().toLowerCase());

    expect(format('  HELLO  ')).toBe('hello');
    expect(format).toHaveBeenCalledOnce();
  });
});
