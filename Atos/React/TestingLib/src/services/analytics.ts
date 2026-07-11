// Side-effect module — ideal candidate for manual or automatic mocks.
export function trackEvent(eventName: string, payload?: Record<string, unknown>) {
  console.log('[analytics]', eventName, payload);
}

export function identifyUser(userId: string) {
  console.log('[analytics] identify', userId);
}
