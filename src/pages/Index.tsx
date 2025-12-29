import { useNavigate } from 'react-router-dom';
import { useLessons, useTopics, useAllTopics } from '@/hooks/useSupabase';
import { LessonCard } from '@/components/LessonCard';
import { canAccessFinalTest, getOverallProgress, getBestFinalTestScore } from '@/lib/progress';
import { Trophy, Lock, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
const Index = () => {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useLessons();
  const { data: allTopics } = useAllTopics();

  const allTopicIds = allTopics?.map(t => t.id) || [];
  const canAccessFinal = canAccessFinalTest(allTopicIds);
  const overallProgress = getOverallProgress(allTopicIds);
  const bestFinalScore = getBestFinalTestScore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('phone_auth');
    localStorage.removeItem('phone_number');
    navigate('/auth');
  };

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

        {/* Final Test Card */}
        <div className="mt-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <button
            onClick={() => canAccessFinal && navigate('/final-test')}
            disabled={!canAccessFinal}
            className={cn(
              "w-full text-left p-8 rounded-xl border-2 transition-all duration-300",
              canAccessFinal
                ? "bg-card border-success/50 card-hover card-glow cursor-pointer"
                : "bg-card border-muted/30 opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center shrink-0",
                canAccessFinal ? "bg-success/20" : "bg-muted/20"
              )}>
                {canAccessFinal ? (
                  <Trophy className="w-8 h-8 text-success" />
                ) : (
                  <Lock className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">
                  Yakuniy Test
                </h3>
                <p className="text-muted-foreground">
                  {canAccessFinal 
                    ? `40 та рандом савол • Энг яхши натижа: ${bestFinalScore > 0 ? bestFinalScore.toFixed(0) + '%' : 'ҳали ўтилмаган'}`
                    : `Очиш учун барча мавзуларда 95%+ тўпланг (${overallProgress.completed}/${overallProgress.total} тугатилган)`
                  }
                </p>
              </div>
            </div>
          </button>
        </div>
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
