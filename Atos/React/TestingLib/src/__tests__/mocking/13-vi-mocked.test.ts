import { describe, expect, it, vi, type Mock } from 'vitest';

describe('13. vi.mocked() for type-safe assertions', () => {
  it('narrows a mock to its full Mock type', () => {
    const handler = vi.fn((value: string) => value.toUpperCase()) as Mock<
      (value: string) => string
    >;

    handler('hello');

    const mocked = vi.mocked(handler);
    expect(mocked).toHaveBeenCalledOnce();
    expect(mocked.mock.results[0]?.value).toBe('HELLO');
  });
});
