import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthenticatedGreeting } from '../../components/AuthenticatedGreeting';
import { renderWithAuth } from '../../test/renderWithAuth';

describe('10. Context provider mocking', () => {
  it('shows greeting when auth context supplies a user', () => {
    renderWithAuth(<AuthenticatedGreeting />);

    expect(screen.getByText(/welcome, test-user/i)).toBeInTheDocument();
  });

  it('shows sign-in prompt when auth is overridden to logged out', () => {
    renderWithAuth(<AuthenticatedGreeting />, {
      auth: { isAuthenticated: false, username: null },
    });

    expect(screen.getByText(/please sign in/i)).toBeInTheDocument();
  });
});
