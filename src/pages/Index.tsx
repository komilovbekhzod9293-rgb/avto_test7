import { useNavigate } from 'react-router-dom';
import { useLessons, useTopics, useAllTopics } from '@/hooks/useSupabase';
import { LessonCard } from '@/components/LessonCard';
import { isLessonUnlocked, getLessonProgress } from '@/lib/progress';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useLessons();
  const { data: allTopics } = useAllTopics();

  const handleLogout = () => {
    localStorage.removeItem('phone_auth');
    localStorage.removeItem('phone_number');
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
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in relative">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="absolute right-0 top-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Чиқиш
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            ЙҲҚ тестлари
          </h1>
          <p className="text-lg text-muted-foreground">
            Дарсни танланг ва тестларни ечишни бошланг
          </p>
        </div>

        {/* Lessons Grid */}
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

import { Topic, Lesson } from '@/types/database';

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
