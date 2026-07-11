import { AuthProvider } from './context/AuthContext';
import { UserProfile } from './components/UserProfile';

export function App() {
  return (
    <AuthProvider>
      <main>
        <h1>RTL Mocking Examples</h1>
        <UserProfile userId="42" />
      </main>
    </AuthProvider>
  );
}
