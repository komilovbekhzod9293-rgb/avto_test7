import { useNavigate } from 'react-router-dom';
import { useLessons, useTopics } from '@/hooks/useSupabase';
import { LessonCard } from '@/components/LessonCard';

const Index = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useLessons();

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
        <div className="text-center mb-12 animate-fade-in">
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
            <LessonCardWithTopicCount
              key={lesson.id}
              lessonId={lesson.id}
              title={lesson.title}
              index={index}
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

function LessonCardWithTopicCount({ 
  lessonId, 
  title, 
  index, 
  onClick 
}: { 
  lessonId: string; 
  title: string; 
  index: number; 
  onClick: () => void;
}) {
  const { data: topics } = useTopics(lessonId);
  
  return (
    <LessonCard
      title={title}
      topicCount={topics?.length ?? 0}
      index={index}
      onClick={onClick}
    />
  );
}

export default Index;
