import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons, useTopics, useAllTopics } from '@/hooks/useSupabase';
import { LessonCard } from '@/components/LessonCard';
import { isLessonUnlocked, getLessonProgress } from '@/lib/progress';
import { clearSession } from '@/hooks/useAuth';
import { useFriendsList } from '@/hooks/useFriends';
import { useDuelList } from '@/hooks/useDuels';
import { LogOut, User, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Topic, Lesson } from '@/types/database';

const Index = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useLessons();
  const { data: allTopics } = useAllTopics();
  const { data: friendsData } = useFriendsList();
  const { data: duelData } = useDuelList();
  const friendRequestCount = friendsData?.incoming?.length ?? 0;
  const duelInviteCount = duelData?.incoming?.length ?? 0;

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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-fade-in relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/leaderboard')}
              className="relative"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Турнир
              {duelInviteCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-destructive-foreground">
                  {duelInviteCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="relative"
            >
              <User className="w-4 h-4 mr-2" />
              Профиль
              {friendRequestCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-destructive-foreground">
                  {friendRequestCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Чиқиш
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ЙҲҚ тестлари
          </h1>
          <p className="text-lg text-muted-foreground">
            Дарсни танланг ва тестларни ечишни бошланг
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

function LessonCardWithProgress({ 
  lessonId, 
  title, 
  index, 
  allTopics,
  allLessons,
  onClick 
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
