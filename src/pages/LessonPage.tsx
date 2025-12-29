import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLesson, useTopics, useQuestions, useLessons, useAllTopics } from '@/hooks/useSupabase';
import { TopicCard } from '@/components/TopicCard';
import { isTopicUnlocked } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Topic, Lesson } from '@/types/database';

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  const { data: lesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: topics, isLoading: topicsLoading } = useTopics(lessonId);
  const { data: allLessons } = useLessons();
  const { data: allTopics } = useAllTopics();

  if (lessonLoading || topicsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Орқага
        </Button>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {lesson?.title ?? 'Дарс'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Тестни бошлаш учун мавзуни танланг
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics?.map((topic, index) => (
            <TopicCardWithQuestionCount
              key={topic.id}
              topicId={topic.id}
              title={topic.title_uz_cyr}
              index={index}
              allTopics={allTopics || []}
              allLessons={allLessons || []}
              onClick={() => navigate(`/topic/${topic.id}/video`)}
            />
          ))}
        </div>

        {(!topics || topics.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Мавзулар топилмади</p>
          </div>
        )}
      </div>
    </div>
  );
};

function TopicCardWithQuestionCount({
  topicId,
  title,
  index,
  allTopics,
  allLessons,
  onClick,
}: {
  topicId: string;
  title: string;
  index: number;
  allTopics: Topic[];
  allLessons: Lesson[];
  onClick: () => void;
}) {
  const { data: questions } = useQuestions(topicId);
  const isUnlocked = isTopicUnlocked(topicId, allTopics, allLessons);

  return (
    <TopicCard
      title={title}
      questionCount={questions?.length ?? 0}
      topicId={topicId}
      index={index}
      isUnlocked={isUnlocked}
      onClick={onClick}
    />
  );
}

export default LessonPage;
