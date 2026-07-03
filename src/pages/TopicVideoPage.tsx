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
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* toolbar */}
        <div className="sticky top-4 z-30 glass-strong rounded-2xl h-14 flex items-center px-2.5 mb-8">
          <button
            onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
            aria-label="Орқага"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="ml-2 font-mono text-[12px] uppercase tracking-wider text-muted-foreground">Видео дарс</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8 reveal reveal-show">
          <h1 className="font-display text-[clamp(1.6rem,4vw,2.5rem)] font-bold tracking-tight text-foreground mb-2">
            {topic?.title_uz_cyr}
          </h1>
          <p className="text-muted-foreground">
            {embedUrl ? 'Видео дарсни томоша қилинг ва тестни бошланг' : 'Тестни бошланг'}
          </p>
        </div>

        {/* Video */}
        {embedUrl && (
          <div className="reveal reveal-show glass-card p-2 rounded-[24px] mb-8" style={{ animationDelay: '80ms' }}>
            <div className="aspect-video w-full rounded-[18px] overflow-hidden bg-black">
              <iframe
                src={embedUrl}
                title={topic?.title_uz_cyr || 'Video lesson'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Start Test */}
        <div className="text-center reveal reveal-show" style={{ animationDelay: '160ms' }}>
          <Button
            size="lg"
            onClick={handleStartTest}
            className="cta-primary h-14 px-10 text-lg font-bold rounded-full"
          >
            <Play className="w-5 h-5 mr-2 fill-current" />
            Тестни бошлаш
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicVideoPage;
