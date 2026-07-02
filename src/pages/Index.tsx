import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons, useTopics, useAllTopics } from '@/hooks/useSupabase';
import { LessonCard } from '@/components/LessonCard';
import { ProgressRing } from '@/components/ProgressRing';
import { Logo } from '@/components/landing/Logo';
import { isLessonUnlocked, getLessonProgress, getTopicProgress } from '@/lib/progress';
import { clearSession } from '@/hooks/useAuth';
import { useFriendsList } from '@/hooks/useFriends';
import { useDuelList } from '@/hooks/useDuels';
import { LogOut, User, Trophy, BookOpen } from 'lucide-react';
import { UserCountBadge } from '@/components/UserCountBadge';
import { cn } from '@/lib/utils';
import { Topic, Lesson } from '@/types/database';

const Index = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useLessons();
  const { data: allTopics } = useAllTopics();
  const { data: friendsData } = useFriendsList();
  const { data: duelData } = useDuelList();
  const friendRequestCount = friendsData?.incoming?.length ?? 0;
  const duelInviteCount = duelData?.incoming?.length ?? 0;

  const totalTopics = allTopics?.length ?? 0;
  const completedTopics = allTopics?.filter((tp) => getTopicProgress(tp.id)?.completed).length ?? 0;
  const overallPct = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  const handleLogout = () => {
    clearSession();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* ambient background */}
      <div className="aurora fixed inset-0 -z-20 opacity-60" />
      <div className="grid-bg fixed inset-0 -z-10" />

      {/* top toolbar */}
      <div className="sticky top-0 z-30 px-3 sm:px-4 pt-3">
        <div className="max-w-6xl mx-auto glass-strong rounded-2xl px-3 sm:px-4 h-14 flex items-center justify-between">
          <Logo className="text-lg" />
          <div className="flex items-center gap-1.5">
            <ToolbarButton icon={Trophy} label="Турнир" badge={duelInviteCount} onClick={() => navigate('/leaderboard')} />
            <ToolbarButton icon={BookOpen} label="Ma'lumotlar" onClick={() => navigate('/foydali-malumotlar')} />
            <ToolbarButton icon={User} label="Профиль" badge={friendRequestCount} onClick={() => navigate('/profile')} />
            <ToolbarButton icon={LogOut} label="Чиқиш" onClick={handleLogout} danger />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        {/* hero header */}
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 items-stretch mb-10">
          <div className="reveal reveal-show">
            <div className="mb-3"><UserCountBadge /></div>
            <h1 className="font-display font-extrabold tracking-tightest text-[clamp(2rem,5vw,3.25rem)] leading-[1.02] text-foreground mb-3">
              ЙҲҚ <span className="text-gradient-primary">тестлари</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-md">
              Дарсни танланг ва тестларни ечишни бошланг. Ҳар бир мавзу — мнемоника усулида.
            </p>
          </div>

          {/* overall progress card */}
          <div className="reveal reveal-show glass-card rounded-3xl p-5 flex items-center gap-5" style={{ animationDelay: '80ms' }}>
            <ProgressRing value={overallPct} size={92} stroke={7} tone={overallPct >= 100 ? 'success' : 'primary'}>
              <div className="text-center">
                <p className="text-xl font-black tabular-nums text-foreground leading-none">{Math.round(overallPct)}%</p>
              </div>
            </ProgressRing>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Умумий прогресс</p>
              <p className="text-2xl font-black text-foreground tabular-nums leading-none font-display">
                {completedTopics}<span className="text-muted-foreground text-lg">/{totalTopics}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">мавзу тугатилган</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons?.map((lesson, index) => (
            <LessonCardWithProgress
              key={lesson.id}
              lessonId={lesson.id}
              title={lesson.title}
              index={index}
              allTopics={allTopics || []}
              allLessons={lessons || []}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            />
          ))}
        </div>
        {(!lessons || lessons.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Дарслар топилмади</p>
          </div>
        )}
      </div>
    </div>
  );
};

function ToolbarButton({
  icon: Icon,
  label,
  badge = 0,
  onClick,
  danger,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full px-3 h-9 text-sm font-semibold transition-colors',
        'text-muted-foreground hover:text-foreground hover:bg-foreground/5',
        danger && 'hover:text-destructive',
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

function LessonCardWithProgress({
  lessonId,
  title,
  index,
  allTopics,
  allLessons,
  onClick,
}: {
  lessonId: string;
  title: string;
  index: number;
  allTopics: Topic[];
  allLessons: Lesson[];
  onClick: () => void;
}) {
  const { data: topics } = useTopics(lessonId);
  const isUnlocked = isLessonUnlocked(lessonId, allTopics, allLessons);
  const lessonProgress = getLessonProgress(lessonId, allTopics);

  return (
    <LessonCard
      title={title}
      topicCount={topics?.length ?? 0}
      completedCount={lessonProgress.completed}
      index={index}
      isUnlocked={isUnlocked}
      onClick={onClick}
    />
  );
}

export default Index;
