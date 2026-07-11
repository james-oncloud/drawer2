import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserProfile } from '../../components/UserProfile';
import * as api from '../../services/api';

describe('5. vi.spyOn', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('spies on console.log without replacing console', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    console.log('hello');
    expect(logSpy).toHaveBeenCalledWith('hello');
  });

  it('stubs a single method on a module', async () => {
    const fetchSpy = vi.spyOn(api, 'fetchUser').mockResolvedValue({
      id: '7',
      name: 'Spy User',
      email: 'spy@example.com',
    });

    render(<UserProfile userId="7" />);

    expect(await screen.findByDisplayValue('Spy User')).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledWith('7');
  });
});
