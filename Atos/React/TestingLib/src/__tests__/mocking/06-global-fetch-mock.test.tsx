import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserProfile } from '../../components/UserProfile';

describe('6. Global fetch mock', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('stubs fetch for a single test', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '5', name: 'Fetch Mock', email: 'fetch@example.com' }),
    } as Response);

    render(<UserProfile userId="5" />);

    expect(await screen.findByDisplayValue('Fetch Mock')).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.example.com/users/5');
  });
});
