import { BookOpen, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopicProgress } from '@/lib/progress';

interface TopicCardProps {
  title: string;
  questionCount: number;
  isLocked: boolean;
  topicId: string;
  index: number;
  onClick: () => void;
}

export function TopicCard({ title, questionCount, isLocked, topicId, index, onClick }: TopicCardProps) {
  const progress = getTopicProgress(topicId);
  const isCompleted = progress?.completed ?? false;
  const bestScore = progress?.bestScore ?? 0;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-300",
        "animate-fade-in",
        isLocked 
          ? "bg-locked border-border/50 cursor-not-allowed opacity-60"
          : isCompleted
            ? "bg-card border-success/50 card-hover"
            : "bg-card border-primary/30 card-hover card-glow"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        isLocked 
          ? "bg-muted" 
          : isCompleted 
            ? "bg-success/20" 
            : "bg-primary/20"
      )}>
        {isLocked ? (
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
        isLocked ? "text-muted-foreground" : "text-foreground"
      )}>
        {title}
      </h3>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {questionCount} та савол
        {!isLocked && bestScore > 0 && (
          <span className="ml-2">
            • Натижа: {bestScore.toFixed(0)}%
          </span>
        )}
      </p>

      {/* Locked overlay message */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
            Олдинги мавзуда 95% тўпланг
          </span>
        </div>
      )}

      {/* Pass requirement */}
      {!isLocked && !isCompleted && (
        <p className="text-xs text-muted-foreground mt-2">
          Ўтиш балли: 95%
        </p>
      )}
    </button>
  );
}
