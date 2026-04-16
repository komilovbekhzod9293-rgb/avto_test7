

# Защита сайта: rate limiting + защита данных

## Проблема 1: Перебор номеров через phone-check

Сейчас edge function `phone-check` не ограничивает количество запросов. Скрипт может перебрать миллионы номеров.

### Решение: Rate limiting на сервере

Создадим таблицу `phone_check_attempts` на Lovable Cloud для хранения попыток:
- `ip_hash` (текст) — хэш IP-адреса
- `phone_hash` (текст) — хэш номера телефона  
- `attempted_at` (timestamp)

В edge function `phone-check` добавим проверку:
- Максимум **5 попыток с одного IP за 24 часа**
- Максимум **5 попыток на один номер за 24 часа**
- При превышении — возврат ошибки 429 (Too Many Requests)

Хэшируем IP и номер чтобы не хранить их в открытом виде. RLS на таблицу закроем полностью — доступ только через service role из edge function.

Дополнительно на фронте добавим localStorage-счётчик (5 попыток в сутки) как быструю защиту от случайного спама, но основная защита — на сервере.

## Проблема 2: Внешний Supabase URL виден в коде

Файл `src/lib/supabase.ts` содержит URL и ключ внешнего Supabase (`ziqzprosgzevkdfwyotl`). Любой может через DevTools увидеть их и напрямую скачать все lessons, topics, questions, answers.

### Решение: Edge function-прокси для данных

Создадим edge function `get-data` на Lovable Cloud:
- Принимает запрос типа `{ table: "lessons" }` или `{ table: "questions", topic_id: "..." }`
- Внутри подключается к внешнему Supabase через service role key (скрыт от браузера)
- Проверяет что пользователь авторизован (phone_auth)
- Возвращает данные

На фронте:
- Удаляем `src/lib/supabase.ts` с прямыми credentials
- Обновляем `useSupabase.ts` — все запросы идут через `supabase.functions.invoke('get-data')`

Нужно будет сохранить два новых секрета:
- `EXTERNAL_SUPABASE_URL` — URL внешнего Supabase
- `EXTERNAL_SUPABASE_SERVICE_KEY` — service role key внешнего Supabase

## Порядок работы

1. Создать таблицу `phone_check_attempts` + RLS (миграция)
2. Обновить edge function `phone-check` с rate limiting
3. Добавить секреты внешнего Supabase
4. Создать edge function `get-data`
5. Обновить `useSupabase.ts` и удалить `src/lib/supabase.ts`
6. Добавить localStorage rate limit на фронте

## Что НЕ трогаем
- Логику проверки ответов
- Структуру внешней базы данных
- Логику прогрессии и разблокировки

## Результат
- Перебор номеров ограничен 5 попытками в сутки
- URL и ключ внешней базы полностью скрыты от браузера
- Данные доступны только через серверную функцию

