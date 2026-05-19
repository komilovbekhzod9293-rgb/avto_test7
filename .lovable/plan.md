## Проблема

В `QuestionView` цвет выбранного ответа определяется по `is_correct` **самого выбранного ответа**:
```
const isCorrect = isAnswerCorrect(answer.is_correct);
```

А в `QuestionNumbers` логика другая — ищется **первый** правильный ответ в массиве, и выбранный сравнивается с его `id`:
```
const correct = q.answers.find(a => isAnswerCorrect(a.is_correct));
state = correct && selectedId === correct.id ? 'correct' : 'wrong';
```

Если в БД у вопроса помечено несколько ответов как правильные (или порядок отличается), пользователь может выбрать ответ, у которого `is_correct = true`, но это не первый правильный в массиве. Тогда:
- внизу (QuestionView) — зелёный ✅
- наверху (QuestionNumbers) — красный ❌

И наоборот возможно при странных данных. Это и есть наблюдаемое несовпадение.

## Решение

Привести логику `QuestionNumbers` к той же, что в `QuestionView`: смотреть на `is_correct` **самого выбранного ответа**, а не сравнивать id с «первым правильным».

### Файл: `src/components/QuestionNumbers.tsx`

Заменить блок определения `state`:
```ts
if (selectedId) {
  const selected = q.answers.find(a => a.id === selectedId);
  state = selected && isAnswerCorrect(selected.is_correct) ? 'correct' : 'wrong';
}
```

Больше ничего не трогать — стили, ring для текущего вопроса, клики остаются как есть.

## Проверка

1. Открыть тест, где раньше был замечен мисматч → убедиться, что верх и низ совпадают.
2. Открыть тест с одним правильным ответом → поведение прежнее (зелёный/красный совпадает).
3. Перелистывание стрелками и клик по номеру — без изменений.
