import { ArrowRight, BookOpen, CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTopicProgress, useProgressVersion } from '@/lib/progress';

interface TopicCardProps {
  title: string;
  questionCount: number;
  topicId: string;
  index: number;
  isUnlocked: boolean;
  onClick: () => void;
}

export function TopicCard({ title, questionCount, topicId, index, isUnlocked, onClick }: TopicCardProps) {
  useProgressVersion();
  const progress = getTopicProgress(topicId);
  const isCompleted = progress?.completed ?? false;
  const bestScore = progress?.bestScore ?? 0;

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        'group reveal reveal-show relative w-full text-left p-5 rounded-3xl transition-all duration-300 overflow-hidden',
        !isUnlocked && 'opacity-55 cursor-not-allowed glass',
        isUnlocked && !isCompleted && 'glass-card card-hover cursor-pointer hover:glow-soft',
        isUnlocked && isCompleted && 'glass-card card-hover cursor-pointer border-success/30',
      )}
    >
      {isUnlocked && (
        <div className={cn(
          'absolute -right-16 -top-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          isCompleted ? 'bg-success/20' : 'bg-primary/20',
        )} />
      )}

      <div className="relative flex items-center gap-3.5">
        <div
          className={cn(
            'shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center',
            !isUnlocked && 'bg-foreground/5',
            isUnlocked && !isCompleted && 'bg-primary/15',
            isUnlocked && isCompleted && 'bg-success/15',
          )}
        >
          {!isUnlocked ? (
            <Lock className="w-5 h-5 text-muted-foreground" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <BookOpen className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={cn('font-bold text-base leading-tight', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUnlocked ? (
              <span className="tabular-nums">{questionCount} та савол</span>
            ) : (
              'Олдинги мавзуни тугатинг'
            )}
          </p>
        </div>
        {isUnlocked && (
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        )}
      </div>

      {isUnlocked && (
        <div className="relative mt-4 flex items-center justify-between text-xs">
          {bestScore > 0 ? (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold tabular-nums',
                bestScore >= 95 ? 'bg-success/15 text-success' : 'bg-primary/15 text-primary',
              )}
            >
              Натижа: {bestScore.toFixed(0)}%
            </span>
          ) : (
            <span className="text-muted-foreground">Ўтиш балли: 95%</span>
          )}
        </div>
      )}
    </button>
  );
}
