import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { UserProfile } from '../../components/UserProfile';

vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api')>();
  return {
    ...actual,
    fetchUser: vi.fn().mockResolvedValue({
      id: '99',
      name: 'Partial Mock',
      email: 'partial@example.com',
    }),
    // updateUserName stays real and is served by MSW in setup.ts
  };
});

describe('3. Partial module mock (importActual)', () => {
  it('uses mocked fetchUser while other exports remain real', async () => {
    const user = userEvent.setup();
    render(<UserProfile userId="99" />);

    expect(await screen.findByDisplayValue('Partial Mock')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled(),
    );
  });
});
