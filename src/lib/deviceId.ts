import { safeStorage } from '@/lib/safeStorage';
export function getDeviceId(): string {
  let id = safeStorage.getItem('device_id');
  if (!id) {
    id = crypto.randomUUID();
    safeStorage.setItem('device_id', id);
  }
  return id;
}
