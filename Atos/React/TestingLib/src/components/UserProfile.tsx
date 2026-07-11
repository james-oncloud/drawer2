import { useEffect, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { updateUserName } from '../services/api';
import { trackEvent } from '../services/analytics';

type UserProfileProps = {
  userId: string;
};

export function UserProfile({ userId }: UserProfileProps) {
  const { user, loading, error } = useUser(userId);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserName(userId, name);
      trackEvent('user_name_updated', { userId });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p role="status">Loading user…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!user) return null;

  return (
    <section aria-label="User profile">
      <p>Email: {user.email}</p>
      <label htmlFor="name-input">Name</label>
      <input
        id="name-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="button" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
    </section>
  );
}
