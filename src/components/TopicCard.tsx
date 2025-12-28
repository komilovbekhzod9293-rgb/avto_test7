import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopicProgress, canSelectTopic, getActiveTopic } from '@/lib/progress';

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
  const canSelect = canSelectTopic(topicId);
  const activeTopic = getActiveTopic();
  const isActiveTopic = activeTopic === topicId;

  const handleClick = () => {
    if (canSelect) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canSelect}
      className={cn(
        "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-300",
        "animate-fade-in",
        !canSelect && "opacity-50 cursor-not-allowed",
        isCompleted
          ? "bg-card border-success/50 card-hover"
          : isActiveTopic
            ? "bg-card border-warning/50 card-hover"
            : canSelect
              ? "bg-card border-primary/30 card-hover card-glow"
              : "bg-card border-muted/30"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Lock icon for blocked topics */}
      {!canSelect && (
        <div className="absolute top-4 right-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
        isCompleted 
          ? "bg-success/20" 
          : isActiveTopic
            ? "bg-warning/20"
            : "bg-primary/20"
      )}>
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-success" />
        ) : (
          <BookOpen className={cn(
            "w-6 h-6",
            isActiveTopic ? "text-warning" : "text-primary"
          )} />
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

      {/* Status message */}
      {!isCompleted && (
        <p className="text-xs text-muted-foreground mt-2">
          {isActiveTopic 
            ? "Давом эттириш учун 95% тўпланг"
            : !canSelect 
              ? "Аввал жорий мавзуни тугатинг"
              : "Ўтиш балли: 95%"}
        </p>
      )}
    </button>
  );
}