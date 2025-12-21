import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import type { QuestionWithAnswers } from '@/types/database';

interface QuestionViewProps {
  question: QuestionWithAnswers;
  selectedAnswer: string | null;
  showResult: boolean;
  onSelectAnswer: (answerId: string) => void;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function QuestionView({ question, selectedAnswer, showResult, onSelectAnswer }: QuestionViewProps) {
  const imageUrl = getImageUrl(question.image_path);

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
        {/* Image */}
        {imageUrl && (
          <div className="lg:w-3/5 p-4">
            <img
              src={imageUrl}
              alt="Савол расми"
              className="w-full h-auto rounded-xl object-contain max-h-[400px]"
            />
          </div>
        )}

        {/* Answers */}
        <div className={cn(
          "flex-1 p-4 space-y-3",
          !imageUrl && "lg:w-full"
        )}>
          {question.answers.map((answer, idx) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrect = answer.is_correct;
            
            let buttonStyle = "bg-secondary border-primary/30 hover:border-primary/60";
            
            if (showResult && isSelected) {
              buttonStyle = isCorrect 
                ? "bg-success/20 border-success" 
                : "bg-destructive/20 border-destructive";
            } else if (showResult && isCorrect) {
              buttonStyle = "bg-success/20 border-success";
            } else if (isSelected) {
              buttonStyle = "bg-primary/20 border-primary";
            }

            return (
              <button
                key={answer.id}
                onClick={() => !showResult && onSelectAnswer(answer.id)}
                disabled={showResult}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  buttonStyle,
                  !showResult && "hover:scale-[1.01]"
                )}
              >
                <span className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  showResult && isCorrect
                    ? "bg-success text-success-foreground"
                    : showResult && isSelected && !isCorrect
                      ? "bg-destructive text-destructive-foreground"
                      : isSelected
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
