import { useAuth } from '../context/AuthContext';

export function AuthenticatedGreeting() {
  const { isAuthenticated, username } = useAuth();

  if (!isAuthenticated) {
    return <p>Please sign in</p>;
  }

  return <p>Welcome, {username}!</p>;
}
