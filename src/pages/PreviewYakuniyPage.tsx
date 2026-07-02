import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Play } from 'lucide-react';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionNumbers } from '@/components/QuestionNumbers';
import { Button } from '@/components/ui/button';
import { functionsSupabase } from '@/integrations/supabase/functionsClient';
import { cn, isAnswerCorrect } from '@/lib/utils';
import { QuestionWithAnswers } from '@/types/database';

type PreviewQuestion = QuestionWithAnswers & { image_url?: string | null };

// Guest-facing final-test sample (20 fixed questions, no session, no
// progress saved) -- lets a landing-page visitor try the real exam format
// before deciding to register.
const PreviewYakuniyPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<PreviewQuestion[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const start = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await functionsSupabase.functions.invoke('preview-data', {
        body: { action: 'free-final-test' },
      });
      setQuestions(data?.data || []);
      setStarted(true);
    } finally {
      setLoading(false);
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

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl glass">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/20">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Якуний тест — синаб кўринг</h2>
          <p className="text-muted-foreground mb-8">
            Рўйхатдан ўтмасдан 20 та тасодифий савол билан ўзингизни синаб кўринг.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={start} disabled={loading} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {loading ? 'Юкланмоқда...' : 'Бошлаш'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Орқага
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const passed = score >= 95;
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className={cn('max-w-md w-full text-center p-8 rounded-2xl glass', passed ? 'border border-success/50' : 'border border-destructive/50')}>
          <p className="text-4xl font-black mb-2" style={{ color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
            {score}%
          </p>
          <p className="text-muted-foreground mb-8">
            {passed ? 'Аъло натижа! Тўлиқ платформага рўйхатдан ўтинг.' : 'Барча 44 мавзуни ўрганиш учун рўйхатдан ўтинг.'}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Рўйхатдан ўтиш
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Бош саҳифага
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
          <Button variant="ghost" onClick={() => navigate('/')} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
          <span className="text-muted-foreground">Синов тест</span>
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

export default PreviewYakuniyPage;
