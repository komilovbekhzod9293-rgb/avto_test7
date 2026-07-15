import { safeStorage } from '@/lib/safeStorage';

// Fire-and-forget error telemetry (see supabase/functions/client-log).
// sendBeacon survives the tab navigating away and needs no CORS preflight as
// long as the payload is a simple type, hence text/plain instead of JSON.
const LOG_URL = 'https://ziqzprosgzevkdfwyotl.supabase.co/functions/v1/client-log';

export function logClientError(stage: string, code: string | null, detail?: string): void {
  try {
    const body = JSON.stringify({
      stage,
      code,
      detail: (detail ?? '').slice(0, 300),
      login: safeStorage.getItem('login'),
      url: typeof location !== 'undefined' ? location.href : null,
    });
    const beacon =
      typeof navigator !== 'undefined' &&
      typeof navigator.sendBeacon === 'function' &&
      navigator.sendBeacon(LOG_URL, new Blob([body], { type: 'text/plain' }));
    if (!beacon) {
      fetch(LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    /* telemetry must never break the app it observes */
  }
}
