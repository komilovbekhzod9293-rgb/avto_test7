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
        'group reveal reveal-show relative w-full text-left p-7 rounded-3xl transition-all duration-300 overflow-hidden',
        !isUnlocked && 'opacity-55 cursor-not-allowed glass',
        isUnlocked && 'glass-card card-hover cursor-pointer',
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
            <span className={cn(isUnlocked ? 'text-primary' : 'text-muted-foreground')}>{String(index + 1).padStart(2, '0')}</span>
            {' · '}{isUnlocked ? 'Дарс' : 'Ёпиқ'}
          </p>
          <h3 className={cn('font-bold text-xl leading-tight', isUnlocked ? 'text-foreground' : 'text-muted-foreground')}>
            {title}
          </h3>
        </div>

        {isUnlocked ? (
          <ProgressRing value={pct} size={54} stroke={5} tone={isFullyCompleted ? 'success' : 'primary'} className="shrink-0">
            {isFullyCompleted ? (
              <Check className="w-5 h-5 text-success" strokeWidth={3} />
            ) : (
              <span className="text-[12px] font-bold tabular-nums font-mono text-foreground">{Math.round(pct)}%</span>
            )}
          </ProgressRing>
        ) : (
          <span className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </span>
        )}
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isUnlocked ? (
            <span className="tabular-nums">
              {completedCount}/{topicCount} мавзу тугатилган
            </span>
          ) : (
            'Тўлиқ доступ учун: 55-513-27-77'
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
