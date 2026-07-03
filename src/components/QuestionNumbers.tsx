import { cn, isAnswerCorrect } from '@/lib/utils';
import type { QuestionWithAnswers } from '@/types/database';

interface QuestionNumbersProps {
  questions: QuestionWithAnswers[];
  currentIndex: number;
  answers: Record<string, string>;
  onSelect?: (index: number) => void;
}

export function QuestionNumbers({ questions, currentIndex, answers, onSelect }: QuestionNumbersProps) {
  return (
    // p-2 gives the current-item ring room so it isn't clipped by overflow.
    <div className="max-h-52 overflow-y-auto mb-6 p-2 -mx-2">
      <div className="flex flex-wrap gap-2.5">
      {questions.map((q, i) => {
        const selectedId = answers[q.id];
        const isCurrent = i === currentIndex;
        let state: 'current' | 'correct' | 'wrong' | 'idle' = 'idle';

        if (selectedId) {
          const selected = q.answers.find(a => a.id === selectedId);
          state = selected && isAnswerCorrect(selected.is_correct) ? 'correct' : 'wrong';
        }

        const base =
          'w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold border transition-all shrink-0';
        const styles =
          state === 'correct'
            ? 'bg-success text-success-foreground border-success'
            : state === 'wrong'
            ? 'bg-destructive text-destructive-foreground border-destructive'
            : 'bg-secondary text-foreground border-border hover:border-primary/50';
        const ring = isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background border-primary' : '';

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect?.(i)}
            className={cn(base, styles, ring, onSelect && 'cursor-pointer')}
            aria-label={`Савол ${i + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {i + 1}
          </button>
        );
      })}
      </div>
    </div>
  );
}
