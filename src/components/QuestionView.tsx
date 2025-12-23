import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import type { QuestionWithAnswers } from '@/types/database';
import avtotestLogo from '@/assets/avtotest-logo.jpg';

interface QuestionViewProps {
  question: QuestionWithAnswers;
  selectedAnswer: string | null;
  onSelectAnswer: (answerId: string) => void;
}

const ANSWER_LABELS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'];

export function QuestionView({ question, selectedAnswer, onSelectAnswer }: QuestionViewProps) {
  const imageUrl = question.image_path ? getImageUrl(question.image_path) : null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-scale-in">
      {/* Question text */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground leading-relaxed">
          {question.question_uz_cyr}
        </h2>
      </div>

      {/* Content: Image + Answers */}
      <div className="flex flex-col lg:flex-row">
        {/* Image - always shown, either question image or logo */}
        <div className="lg:w-3/5 p-4">
          <img
            src={imageUrl || avtotestLogo}
            alt={imageUrl ? "Савол расми" : "AvtoTest 7"}
            className={cn(
              "w-full h-auto rounded-xl max-h-[400px]",
              imageUrl ? "object-contain" : "object-contain bg-white p-8"
            )}
          />
        </div>

        {/* Answers */}
        <div className="flex-1 p-4 space-y-3">
          {question.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer.id;

            return (
              <button
                key={answer.id}
                onClick={() => onSelectAnswer(answer.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "bg-primary/20 border-primary"
                    : "bg-secondary border-primary/30 hover:border-primary/60",
                  "hover:scale-[1.01]"
                )}
              >
                <span className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {ANSWER_LABELS[idx] || `F${idx + 1}`}
                </span>
                <span className="text-foreground">{answer.answer_uz_cyr}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}