import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { useTopic } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { setActiveTopic } from '@/lib/progress';
import { useEffect } from 'react';

// Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    let videoId = '';
    
    // Format: https://youtu.be/VIDEO_ID
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0] || '';
    }
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split(/[?&#]/)[0] || '';
    }
    
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    // Fail silently on invalid URLs
    return null;
  }
}

const TopicVideoPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const { data: topic, isLoading } = useTopic(topicId);
  
  const embedUrl = topic?.youtube_url ? getYouTubeEmbedUrl(topic.youtube_url) : null;

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
            {embedUrl ? 'Видео дарсни томоша қилинг ва тестни бошланг' : 'Тестни бошланг'}
          </p>
        </div>

        {/* Video Player - only render if youtube_url exists */}
        {embedUrl && (
          <div className="aspect-video w-full max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden border border-border bg-card animate-fade-in">
            <iframe
              src={embedUrl}
              title={topic?.title_uz_cyr || 'Video lesson'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Start Test Button */}
        <div className="text-center animate-fade-in" style={{ animationDelay: embedUrl ? '200ms' : '0ms' }}>
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
