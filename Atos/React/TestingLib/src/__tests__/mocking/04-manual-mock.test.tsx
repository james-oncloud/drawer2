import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Calling vi.mock with no factory loads src/services/__mocks__/analytics.ts
vi.mock('../../services/analytics');
vi.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    user: { id: '1', name: 'A', email: 'a@example.com' },
    loading: false,
    error: null,
  }),
}));

import { UserProfile } from '../../components/UserProfile';
import { trackEvent } from '../../services/analytics';

describe('4. Manual mock via __mocks__ directory', () => {
  it('uses the hand-written mock from services/__mocks__/analytics.ts', async () => {
    const user = userEvent.setup();
    render(<UserProfile userId="1" />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(trackEvent).toHaveBeenCalledWith('user_name_updated', { userId: '1' });
    });
  });
});
