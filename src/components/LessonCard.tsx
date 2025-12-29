import { BookOpen, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  title: string;
  topicCount: number;
  completedCount: number;
  index: number;
  isUnlocked: boolean;
  onClick: () => void;
}

export function LessonCard({ 
  title, 
  topicCount, 
  completedCount,
  index, 
  isUnlocked,
  onClick 
}: LessonCardProps) {
  const isFullyCompleted = completedCount === topicCount && topicCount > 0;

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      className={cn(
        "w-full text-left p-6 rounded-xl border-2 transition-all duration-300",
        "animate-fade-in",
        !isUnlocked && "opacity-60 cursor-not-allowed border-muted/30 bg-muted/10",
        isUnlocked && !isFullyCompleted && "bg-card border-primary/30 card-hover card-glow cursor-pointer",
        isUnlocked && isFullyCompleted && "bg-card border-success/50 card-hover cursor-pointer"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        !isUnlocked && "bg-muted/20",
        isUnlocked && !isFullyCompleted && "bg-primary/20",
        isUnlocked && isFullyCompleted && "bg-success/20"
      )}>
        {!isUnlocked ? (
          <Lock className="w-6 h-6 text-muted-foreground" />
        ) : isFullyCompleted ? (
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
            {completedCount}/{topicCount} мавзу тугатилган
          </>
        ) : (
          <>Олдинги дарсни тугатинг</>
        )}
      </p>
    </button>
  );
}
