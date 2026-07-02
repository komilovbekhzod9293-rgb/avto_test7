import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionNumbers } from '@/components/QuestionNumbers';
import { Button } from '@/components/ui/button';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';
import { cn, isAnswerCorrect } from '@/lib/utils';
import { Lesson, Topic, QuestionWithAnswers } from '@/types/database';

type PreviewQuestion = QuestionWithAnswers & { image_url?: string | null };

// Guest-facing free preview of the first lesson -- pick any topic in it and
// take the test with no session, no registration, no saved progress.
const PreviewLessonPage = () => {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingLesson, setLoadingLesson] = useState(true);

  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await functionsSupabase.functions.invoke('preview-data', {
        body: { action: 'free-lesson' },
      });
      setLesson(data?.data?.lesson ?? null);
      setTopics(data?.data?.topics ?? []);
      setLoadingLesson(false);
    })();
  }, []);

  const startTopic = useCallback(async (topic: Topic) => {
    setLoadingQuestions(true);
    setActiveTopic(topic);
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);
    try {
      const { data } = await functionsSupabase.functions.invoke('preview-data', {
        body: { action: 'free-topic-questions', topic_id: topic.id },
      });
      setQuestions(data?.data || []);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const total = questions.length;
  const current = questions[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    let correct = 0;
    questions.forEach((q) => {
      const selectedId = answers[q.id];
      const correctAnswer = q.answers.find((a) => isAnswerCorrect(a.is_correct));
      if (selectedId && correctAnswer && selectedId === correctAnswer.id) correct++;
    });
    setScore(Math.round((correct / total) * 100));
    setFinished(true);
  }, [currentIndex, total, questions, answers]);

  const handleSelect = useCallback(
    (answerId: string) => {
      if (!current || answers[current.id]) return;
      setAnswers((prev) => ({ ...prev, [current.id]: answerId }));
      setTimeout(handleNext, 1200);
    },
    [current, answers, handleNext],
  );

  if (!activeTopic) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center text-foreground hover:bg-secondary/50 transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{lesson?.title ?? 'Бепул дарс'}</h1>
              <p className="text-sm text-muted-foreground">Рўйхатдан ўтмасдан бепул синаб кўринг</p>
            </div>
          </div>

          {loadingLesson ? (
            <div className="text-center text-muted-foreground py-12">Юкланмоқда...</div>
          ) : (
            <div className="grid gap-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => startTopic(topic)}
                  className="glass rounded-xl p-5 text-left flex items-center gap-4 card-hover"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{topic.title_uz_cyr}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loadingQuestions) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Юкланмоқда...</div>;
  }

  if (finished) {
    const passed = score >= 95;
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className={cn('max-w-md w-full text-center p-8 rounded-2xl glass', passed ? 'border border-success/50' : 'border border-destructive/50')}>
          <p className="text-4xl font-black mb-2" style={{ color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
            {score}%
          </p>
          <p className="text-muted-foreground mb-8">Бошқа 43 мавзуни ҳам ўрганиш учун рўйхатдан ўтинг.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Рўйхатдан ўтиш
            </Button>
            <Button variant="outline" onClick={() => setActiveTopic(null)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Мавзуларга қайтиш
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setActiveTopic(null)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
          <span className="text-muted-foreground">{activeTopic.title_uz_cyr}</span>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <ProgressBar current={currentIndex + 1} total={total} className="flex-1" />
          <span className="text-sm text-muted-foreground shrink-0">{currentIndex + 1}/{total}</span>
        </div>
        <QuestionNumbers questions={questions} currentIndex={currentIndex} answers={answers} />
        <QuestionView question={current} selectedAnswer={answers[current.id] ?? null} onSelectAnswer={handleSelect} />
      </div>
    </div>
  );
};

export default PreviewLessonPage;
