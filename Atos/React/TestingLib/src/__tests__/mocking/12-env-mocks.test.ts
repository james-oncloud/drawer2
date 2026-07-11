import { afterEach, describe, expect, it, vi } from 'vitest';

describe('12. Environment variable mocking', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('reads mocked import.meta.env after resetModules', async () => {
    vi.stubEnv('VITE_API_URL', 'https://custom.api.test');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Env', email: 'env@example.com' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    vi.resetModules();
    const { fetchUser } = await import('../../services/api');

    await fetchUser('1');

    expect(fetchMock).toHaveBeenCalledWith('https://custom.api.test/users/1');
  });
});
