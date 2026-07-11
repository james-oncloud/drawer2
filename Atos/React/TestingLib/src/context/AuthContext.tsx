import { createContext, useContext, type ReactNode } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  username: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: AuthContextValue;
}) {
  const defaultValue: AuthContextValue = {
    isAuthenticated: false,
    username: null,
  };

  return (
    <AuthContext.Provider value={value ?? defaultValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
