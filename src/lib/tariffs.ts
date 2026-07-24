import type { TariffId } from './pendingTariff';

// Keep in sync with supabase/functions/_shared/multicard.ts TARIFFS --
// that file is the source of truth for the actual amount charged; this is
// only for display before the invoice is created.
export const TARIFF_DISPLAY: Record<TariffId, { name: string; priceSum: number; durationDays: number }> = {
  standard: { name: 'Тариф Стандарт', priceSum: 45_000, durationDays: 14 },
  pro: { name: 'Тариф Про', priceSum: 70_000, durationDays: 30 },
  max: { name: 'Тариф Макс', priceSum: 499_000, durationDays: 30 },
};
