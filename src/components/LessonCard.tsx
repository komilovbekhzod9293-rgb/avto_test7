import { ArrowRight, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/ProgressRing';

interface LessonCardProps {
  title: string;
  topicCount: number;
  completedCount: number;
  index: number;
  isUnlocked: boolean;
  onClick: () => void;
}

export function LessonCard({ title, topicCount, completedCount, index, isUnlocked, onClick }: LessonCardProps) {
  const isFullyCompleted = completedCount === topicCount && topicCount > 0;
  const pct = topicCount > 0 ? (completedCount / topicCount) * 100 : 0;

  return (
    <button
      onClick={isUnlocked ? onClick : undefined}
      disabled={!isUnlocked}
      style={{ animationDelay: `${index * 60}ms` }}
      className={cn(
        'group reveal reveal-show relative w-full text-left p-5 rounded-3xl transition-all duration-300 overflow-hidden',
        !isUnlocked && 'opacity-55 cursor-not-allowed glass',
        isUnlocked && 'glass-card card-hover cursor-pointer hover:glow-soft',
      )}
    >
      {/* accent corner glow on hover */}
      {isUnlocked && (
        <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center font-display font-extrabold text-lg',
              isUnlocked ? 'bg-primary/15 text-primary' : 'bg-foreground/5 text-muted-foreground',
            )}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {isUnlocked ? 'Дарс' : 'Ёпиқ'}
            </p>
            <h3 className={cn('font-bold text-lg leading-tight truncate', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
              {title}
            </h3>
          </div>
        </div>

        {isUnlocked ? (
          <ProgressRing value={pct} tone={isFullyCompleted ? 'success' : 'primary'}>
            {isFullyCompleted ? (
              <Check className="w-4 h-4 text-success" strokeWidth={3} />
            ) : (
              <span className="text-[11px] font-black tabular-nums text-foreground">{Math.round(pct)}%</span>
            )}
          </ProgressRing>
        ) : (
          <span className="w-11 h-11 rounded-2xl bg-foreground/5 flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isUnlocked ? (
            <span className="tabular-nums">
              {completedCount}/{topicCount} мавзу тугатилган
            </span>
          ) : (
            'Олдинги дарсни тугатинг'
          )}
        </p>
        {isUnlocked && (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary opacity-70 group-hover:opacity-100 group-hover:gap-2 transition-all">
            Очиш <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </button>
  );
}
