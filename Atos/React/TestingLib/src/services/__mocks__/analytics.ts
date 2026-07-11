import { vi } from 'vitest';

// Manual mock: Vitest/Jest auto-picks files in __mocks__ adjacent to the module.
export const trackEvent = vi.fn();
export const identifyUser = vi.fn();
