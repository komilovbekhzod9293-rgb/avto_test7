

# Улучшение безопасности — Edge Function для device-check

## Что будет сделано

1. **Создать edge function `device-check`** (`supabase/functions/device-check/index.ts`)
   - Принимает `{ phone, device_id }`, проверяет/создает привязку
   - Использует `SUPABASE_SERVICE_ROLE_KEY` для доступа к таблице
   - Возвращает `{ allowed: true/false, reason?: string }`
   - Включает CORS и валидацию входных данных

2. **Закрыть прямой доступ к таблице** (миграция)
   - Удалить политики "Allow public read/insert/update"
   - Таблица станет доступна только через service role

3. **Обновить `PhoneAuthPage.tsx`**
   - Заменить прямые запросы к `phone_devices` на вызов edge function

4. **Обновить `usePhoneAuthCheck.ts`**
   - Проверка устройства через edge function вместо прямого запроса

## Технические детали

Edge function будет использовать уже настроенный `SUPABASE_SERVICE_ROLE_KEY` для создания Supabase-клиента с полным доступом. Клиентский код будет вызывать функцию через `supabase.functions.invoke('device-check', ...)`.

Важно: функция будет использовать клиент из `@/integrations/supabase/client.ts` (Lovable Cloud), а не из `@/lib/supabase.ts`.

