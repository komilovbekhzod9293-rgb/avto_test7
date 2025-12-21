import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonCardProps {
  title: string;
  topicCount: number;
  index: number;
  onClick: () => void;
}

export function LessonCard({ title, topicCount, index, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-6 rounded-xl border-2 border-primary/30",
        "bg-card card-hover card-glow animate-fade-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-primary" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Info */}
      <p className="text-sm text-muted-foreground">
        {topicCount} та мавзу
      </p>
    </button>
  );
}
