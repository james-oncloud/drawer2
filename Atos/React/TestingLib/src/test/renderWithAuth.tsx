import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';

type AuthOverrides = {
  isAuthenticated?: boolean;
  username?: string | null;
};

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  auth?: AuthOverrides;
};

function createWrapper(auth?: AuthOverrides) {
  return function Wrapper({ children }: { children: ReactNode }) {
    const value = {
      isAuthenticated: auth?.isAuthenticated ?? true,
      username: auth?.username ?? 'test-user',
    };
    return <AuthProvider value={value}>{children}</AuthProvider>;
  };
}

export function renderWithAuth(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { auth, ...renderOptions } = options;
  return render(ui, { wrapper: createWrapper(auth), ...renderOptions });
}
