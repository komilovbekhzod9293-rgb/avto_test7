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
    <div className="flex flex-wrap gap-1.5 mb-6">
      {questions.map((q, i) => {
        const selectedId = answers[q.id];
        const isCurrent = i === currentIndex;
        let state: 'current' | 'correct' | 'wrong' | 'idle' = 'idle';

        if (selectedId) {
          const correct = q.answers.find(a => isAnswerCorrect(a.is_correct));
          state = correct && selectedId === correct.id ? 'correct' : 'wrong';
        }

        const base =
          'w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold border-2 transition-colors shrink-0';
        const styles =
          state === 'correct'
            ? 'bg-success text-success-foreground border-success'
            : state === 'wrong'
            ? 'bg-destructive text-destructive-foreground border-destructive'
            : 'bg-secondary text-foreground border-primary/30';
        const ring = isCurrent ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : '';

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect?.(i)}
            className={cn(base, styles, ring, onSelect && 'hover:opacity-90 cursor-pointer')}
            aria-label={`Савол ${i + 1}`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
