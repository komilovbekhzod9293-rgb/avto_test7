import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { useTopic } from '@/hooks/useSupabase';
import { findVideoForTopic, getYouTubeEmbedUrl } from '@/lib/topicVideos';
import { Button } from '@/components/ui/button';
import { setActiveTopic } from '@/lib/progress';
import { useEffect } from 'react';

const TopicVideoPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const { data: topic, isLoading } = useTopic(topicId);
  
  const videoUrl = topic ? findVideoForTopic(topic.title_uz_cyr) : null;
  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  // Set active topic when viewing video
  useEffect(() => {
    if (topicId) {
      setActiveTopic(topicId);
    }
  }, [topicId]);

  const handleStartTest = () => {
    navigate(`/test/${topicId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {topic?.title_uz_cyr}
          </h1>
          <p className="text-muted-foreground">
            Видео дарсни томоша қилинг ва тестни бошланг
          </p>
        </div>

        {/* Video Player */}
        {embedUrl ? (
          <div className="aspect-video w-full max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden border border-border bg-card animate-fade-in">
            <iframe
              src={embedUrl}
              title={topic?.title_uz_cyr || 'Video lesson'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="aspect-video w-full max-w-4xl mx-auto mb-8 rounded-xl border border-border bg-card flex items-center justify-center animate-fade-in">
            <div className="text-center text-muted-foreground">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Бу мавзу учун видео топилмади</p>
            </div>
          </div>
        )}

        {/* Start Test Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Button
            size="lg"
            onClick={handleStartTest}
            className="h-14 px-8 text-lg font-medium"
          >
            <Play className="w-5 h-5 mr-2" />
            Тестни бошлаш
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicVideoPage;
