import { safeStorage } from '@/lib/safeStorage';

// crypto.randomUUID() is missing on older WebKit (iOS Safari < 15.4, old
// Android WebViews) and on non-HTTPS origins — for those users login crashed
// before the request was even sent ("crypto.randomUUID is not a function"
// flooding client_errors), so fall back to getRandomValues, then Math.random.
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function getDeviceId(): string {
  let id = safeStorage.getItem('device_id');
  if (!id) {
    id = generateUuid();
    safeStorage.setItem('device_id', id);
  }
  return id;
}
