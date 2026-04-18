

# Работа над ошибками после теста

## Идея
Когда пользователь набрал **95-99%** (прошёл, но с ошибками), показываем кнопку **"Xatolar ustida ishlash"**. По клику запускается режим, где он решает только неправильно отвеченные вопросы, пока не угадает правильный ответ.

При **100%** кнопки нет — нечего исправлять.
При **<95%** — только обычный "Қайта бошлаш" (как сейчас).

## Где реализуем
- `src/pages/TestPage.tsx` — для тестов по темам
- `src/pages/YakuniyTestPage.tsx` — для финального теста

(одинаковая логика в обоих местах)

## Что меняем

### 1. На экране результата (TestPage / YakuniyTestPage)
После подсчёта `score` сохраняем массив ID неправильных вопросов:
```
wrongQuestionIds = questions.filter(q => answers[q.id] !== correctAnswerId).map(q => q.id)
```

Условия отображения кнопок:
- `score === 100` → только "Мавзуларга қайтиш"
- `score >= 95 && wrongQuestionIds.length > 0` → **"Xatolar ustida ishlash"** + "Мавзуларга қайтиш"
- `score < 95` → "Қайта бошлаш" + "Мавзуларга қайтиш" (как сейчас)

### 2. Новый режим "работа над ошибками"
Добавляем состояние `mistakeMode: boolean` и `mistakeQueue: string[]` (ID вопросов).

По клику на кнопку:
- `setMistakeMode(true)`
- `setMistakeQueue(wrongQuestionIds)`
- `setIsFinished(false)`
- Показываем первый вопрос из очереди

### 3. Поведение в режиме ошибок
- Показываем вопрос из `mistakeQueue[0]`
- Пользователь выбирает ответ — мгновенный фидбек (зелёный/красный, как обычно)
- **Если правильно** → автоматически (через ~800мс) переходим к следующему вопросу из очереди, удаляя текущий
- **Если неправильно** → кнопка "Яна уриниб кўриш" сбрасывает выбор, тот же вопрос остаётся
- Когда `mistakeQueue` пустеет → экран "Молодец! Все ошибки исправлены" + кнопка "Мавзуларга қайтиш"

### 4. UI отличия в режиме ошибок
- Прогресс-бар показывает: "Ошибок осталось: X из Y"
- Скрываем кнопки "Олдинги/Кейинги" — навигация автоматическая
- Заголовок сверху: "Xatolar ustida ishlash"
- Прогресс по теме (`setTopicProgress`) **не меняем** — он уже сохранён как 95%+

## Что НЕ трогаем
- Логику проверки ответов (`is_correct`)
- Расчёт процента и сохранение прогресса
- Разблокировку следующих тем (95% уже даёт доступ)
- `QuestionView` компонент
- Edge functions, API

## Технические детали

**Новые состояния в TestPage / YakuniyTestPage:**
```ts
const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
const [mistakeMode, setMistakeMode] = useState(false);
const [mistakeQueue, setMistakeQueue] = useState<string[]>([]);
const [mistakeAnswer, setMistakeAnswer] = useState<string | null>(null);
```

**В `handleNext`** (на финальном шаге) — сохраняем `wrongQuestionIds` перед `setIsFinished(true)`.

**Новые обработчики:**
- `handleStartMistakeMode()` — запускает режим
- `handleMistakeSelectAnswer(id)` — проверяет, правильно→авто-переход, неправильно→ждём retry
- `handleMistakeRetry()` — сбрасывает `mistakeAnswer`
- При завершении очереди показываем финальный экран с поздравлением

