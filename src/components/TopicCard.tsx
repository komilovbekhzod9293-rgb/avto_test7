import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopicProgress } from '@/lib/progress';

interface TopicCardProps {
  title: string;
  questionCount: number;
  topicId: string;
  index: number;
  isUnlocked: boolean;
  onClick: () => void;
}

export function TopicCard({ 
  title, 
  questionCount, 
  topicId, 
  index, 
  isUnlocked,
  onClick 
}: TopicCardProps) {
  const progress = getTopicProgress(topicId);
  const isCompleted = progress?.completed ?? false;
  const bestScore = progress?.bestScore ?? 0;

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={cn(
        "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-300",
        "animate-fade-in",
        !isUnlocked && "opacity-60 cursor-not-allowed border-muted/30 bg-muted/10",
        isUnlocked && !isCompleted && "bg-card border-primary/30 card-hover card-glow cursor-pointer",
        isUnlocked && isCompleted && "bg-card border-success/50 card-hover cursor-pointer"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        !isUnlocked && "bg-muted/20",
        isUnlocked && !isCompleted && "bg-primary/20",
        isUnlocked && isCompleted && "bg-success/20"
      )}>
        {!isUnlocked ? (
          <Lock className="w-6 h-6 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle className="w-6 h-6 text-success" />
        ) : (
          <BookOpen className="w-6 h-6 text-primary" />
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "text-lg font-semibold mb-2",
        isUnlocked ? "text-foreground" : "text-muted-foreground"
      )}>
        {title}
      </h3>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {isUnlocked ? (
          <>
            {questionCount} та савол
            {bestScore > 0 && (
              <span className="ml-2">
                • Натижа: {bestScore.toFixed(0)}%
              </span>
            )}
          </>
        ) : (
          <>Олдинги мавзуни тугатинг</>
        )}
      </p>

      {/* Status message */}
      {isUnlocked && !isCompleted && (
        <p className="text-xs text-muted-foreground mt-2">
          Ўтиш балли: 95%
        </p>
      )}
    </button>
  );
}
