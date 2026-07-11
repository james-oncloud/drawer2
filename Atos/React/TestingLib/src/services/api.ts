export type User = {
  id: string;
  name: string;
  email: string;
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.example.com';

export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch user ${userId}`);
  }
  return response.json() as Promise<User>;
}

export async function updateUserName(userId: string, name: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Update failed');
  }
  return response.json() as Promise<User>;
}
