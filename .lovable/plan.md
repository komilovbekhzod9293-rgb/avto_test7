## Проблема

% считается неверно (например 91% вместо 100%), потому что в базе `is_correct` хранится в разных форматах. Сейчас код проверяет только `=== true` или строку `"true"` (нижний регистр). Если в базе встречается `"True"`, `"TRUE"`, `"t"`, `1`, `"1"` — правильный ответ считается неправильным, и пользователь не получает 100%.

Также в `QuestionView.tsx` подсветка использует `answer.is_correct` напрямую, что для строки `"false"` даст `true` (любая непустая строка truthy) — но это UI-баг подсветки, отдельный.

## Решение

### 1. Добавить хелпер `isAnswerCorrect` в `src/lib/utils.ts`

Нормализует значение в boolean, принимая: `true`, `"true"`, `"True"`, `"TRUE"`, `"t"`, `"T"`, `"1"`, `1`, `"yes"`.

```ts
export function isAnswerCorrect(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    return v === 'true' || v === 't' || v === '1' || v === 'yes';
  }
  return false;
}
```

### 2. Использовать хелпер во всех местах подсчёта

- `src/pages/TestPage.tsx` — заменить все 3 проверки `a.is_correct === true || String(...) === "true"` на `isAnswerCorrect(a.is_correct)` (подсчёт score, mistake mode, wrongIds).
- `src/pages/YakuniyTestPage.tsx` — то же в 3 местах.
- `src/components/QuestionView.tsx` — заменить `const isCorrect = answer.is_correct` на `const isCorrect = isAnswerCorrect(answer.is_correct)`, чтобы подсветка тоже была корректной.

### 3. Доп. защита

Если у вопроса в базе нет ни одного правильного ответа (например все is_correct = `"false"` из-за бага данных), такой вопрос невозможно ответить правильно — он и даёт «вечные» 91%. Добавим `console.warn` со списком ID таких вопросов в `TestPage.tsx` и `YakuniyTestPage.tsx`, чтобы можно было быстро найти и поправить данные. На сам подсчёт это не влияет — просто лог для диагностики.

## Файлы

- `src/lib/utils.ts` — добавить `isAnswerCorrect`
- `src/pages/TestPage.tsx` — использовать хелпер
- `src/pages/YakuniyTestPage.tsx` — использовать хелпер
- `src/components/QuestionView.tsx` — использовать хелпер для подсветки