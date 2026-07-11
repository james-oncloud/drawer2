import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { UserProfile } from '../../components/UserProfile';
import { server } from '../../test/mocks/server';

describe('7. MSW network mocking', () => {
  it('loads user through intercepted HTTP', async () => {
    render(<UserProfile userId="42" />);

    expect(await screen.findByDisplayValue('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/i)).toBeInTheDocument();
  });

  it('overrides a handler per test with server.use', async () => {
    server.use(
      http.get('https://api.example.com/users/:userId', () =>
        HttpResponse.json({
          id: '404',
          name: 'Override',
          email: 'override@example.com',
        }),
      ),
    );

    render(<UserProfile userId="404" />);
    expect(await screen.findByDisplayValue('Override')).toBeInTheDocument();
  });

  it('simulates server errors', async () => {
    server.use(
      http.get('https://api.example.com/users/:userId', () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 }),
      ),
    );

    render(<UserProfile userId="err" />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to fetch/i);
  });
});
