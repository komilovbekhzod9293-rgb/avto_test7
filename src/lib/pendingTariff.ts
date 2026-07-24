import { safeStorage } from '@/lib/safeStorage';

// Order matches the pricing plans array in i18n.ts (uz/ru/en all keep the
// same Standard/Pro/Max order) -- there's no stable id on the plan objects
// themselves, so the landing page maps by index.
export const TARIFF_IDS = ['standard', 'pro', 'max'] as const;
export type TariffId = (typeof TARIFF_IDS)[number];

const KEY = 'pending_tariff';

export function setPendingTariff(tariff: TariffId): void {
  safeStorage.setItem(KEY, tariff);
}

export function takePendingTariff(): TariffId | null {
  const value = safeStorage.getItem(KEY);
  if (!value) return null;
  safeStorage.removeItem(KEY);
  return TARIFF_IDS.includes(value as TariffId) ? (value as TariffId) : null;
}
