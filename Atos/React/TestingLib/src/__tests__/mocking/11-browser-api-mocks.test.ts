import { afterEach, describe, expect, it, vi } from 'vitest';

describe('11. Browser API mocks', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('mocks localStorage with vi.stubGlobal', () => {
    const store = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(() => store.clear()),
      key: vi.fn(),
      length: 0,
    });

    localStorage.setItem('theme', 'dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('mocks window.matchMedia', () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    vi.stubGlobal('matchMedia', matchMediaMock);

    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  });

  it('mocks IntersectionObserver', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [0];

      constructor(_callback: IntersectionObserverCallback) {}

      observe = observe;
      unobserve = vi.fn();
      disconnect = disconnect;
      takeRecords = vi.fn().mockReturnValue([]);
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const callback: IntersectionObserverCallback = vi.fn();
    const observer = new IntersectionObserver(callback);
    observer.observe(document.body);

    expect(observe).toHaveBeenCalledWith(document.body);
  });
});
