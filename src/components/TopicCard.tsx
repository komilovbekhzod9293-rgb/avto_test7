import { BookOpen, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopicProgress } from '@/lib/progress';

interface TopicCardProps {
  title: string;
  questionCount: number;
  topicId: string;
  index: number;
  onClick: () => void;
}

export function TopicCard({ title, questionCount, topicId, index, onClick }: TopicCardProps) {
  const progress = getTopicProgress(topicId);
  const isCompleted = progress?.completed ?? false;
  const bestScore = progress?.bestScore ?? 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-300",
        "animate-fade-in",
        isCompleted
          ? "bg-card border-success/50 card-hover"
          : "bg-card border-primary/30 card-hover card-glow"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        isCompleted 
          ? "bg-success/20" 
          : "bg-primary/20"
      )}>
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-success" />
        ) : (
          <BookOpen className="w-6 h-6 text-primary" />
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title}
      </h3>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {questionCount} та савол
        {bestScore > 0 && (
          <span className="ml-2">
            • Натижа: {bestScore.toFixed(0)}%
          </span>
        )}
      </p>

      {/* Pass requirement */}
      {!isCompleted && (
        <p className="text-xs text-muted-foreground mt-2">
          Ўтиш балли: 95%
        </p>
      )}
    </button>
  );
}