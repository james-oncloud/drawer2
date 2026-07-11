import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserProfile } from '../../components/UserProfile';

// vi.mock is hoisted — applies to this file only.
vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(() => ({
    user: { id: '1', name: 'Mocked User', email: 'mock@example.com' },
    loading: false,
    error: null,
  })),
}));

describe('2. Full module mock (vi.mock)', () => {
  it('renders with mocked hook data without hitting the network', () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByText(/email: mock@example.com/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mocked User')).toBeInTheDocument();
  });
});
