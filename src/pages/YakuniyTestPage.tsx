import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Play, Wrench, CheckCircle2 } from 'lucide-react';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionNumbers } from '@/components/QuestionNumbers';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { clearSession } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn, isAnswerCorrect } from '@/lib/utils';
import { QuestionWithAnswers } from '@/types/database';
import { safeStorage } from '@/lib/safeStorage';
import { getTestLang } from '@/lib/testLang';
import { useT } from '@/hooks/useT';

type FinalTestQuestion = QuestionWithAnswers & { image_url?: string | null };
type RawFinalTestQuestion = Omit<FinalTestQuestion, 'answers'> & {
  answers: QuestionWithAnswers['answers'] | string | null;
};

const QUESTION_COUNT_OPTIONS = [20, 50, 100, 200] as const;

const YakuniyTestPage = () => {
  const navigate = useNavigate();
  const t = useT();

  const [questionCount, setQuestionCount] = useState<number>(20);
  const [questions, setQuestions] = useState<FinalTestQuestion[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  // Mistake review mode
  const [mistakeMode, setMistakeMode] = useState(false);
  const [mistakeQueue, setMistakeQueue] = useState<string[]>([]);
  const [mistakeInitialCount, setMistakeInitialCount] = useState(0);
  const [mistakeAnswer, setMistakeAnswer] = useState<string | null>(null);
  const [mistakeFinished, setMistakeFinished] = useState(false);

  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear auto-next timer on question change / unmount
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
    };
  }, [currentIndex]);

  const startTest = async () => {
    setIsLoadingQuestions(true);
    setLoadError(null);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setWrongQuestionIds([]);

    const session_token = safeStorage.getItem('session_token');
    const device_id = getDeviceId();

    if (!session_token) {
      clearSession();
      setIsLoadingQuestions(false);
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await invokeFunction<RawFinalTestQuestion[]>('get-data', {
        action: 'random-final-test',
        session_token,
        device_id,
        count: questionCount,
        lang: getTestLang(),
      });
      if (error) throw new Error(error);

      const items = data || [];
      const questionsWithAnswers: FinalTestQuestion[] = items.map((q: RawFinalTestQuestion) => ({
        id: q.id,
        topic_id: q.topic_id,
        question_uz_cyr: q.question_uz_cyr,
        image_path: q.image_path,
        image_url: q.image_url,
        order_index: q.order_index,
        answers: Array.isArray(q.answers) ? q.answers : JSON.parse(q.answers || '[]')
      }));

      setQuestions(questionsWithAnswers);
      setTestStarted(true);
    } catch (err) {
      console.error('Error loading random questions:', err);
      setLoadError(
        err instanceof Error && err.message === 'trial_locked'
          ? t('Якуний тест фақат тўлиқ обуна учун очиқ.', 'Финальный тест доступен только с полной подпиской.')
          : t('Тестни юклаб бўлмади. Илтимос, қайта кириб уриниб кўринг.', 'Не удалось загрузить тест. Пожалуйста, войдите заново и попробуйте ещё раз.')
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Preload images
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach(question => {
        const imageUrl = question.image_url;
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
        }
      });
    }
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      let correct = 0;
      const wrongIds: string[] = [];
      const noCorrectAnswerIds: string[] = [];
      questions.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers.find(a => isAnswerCorrect(a.is_correct));
        if (!correctAnswer) noCorrectAnswerIds.push(q.id);
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) {
          correct++;
        } else {
          wrongIds.push(q.id);
        }
      });
      if (noCorrectAnswerIds.length > 0) {
        console.warn('[YakuniyTest] Questions with no correct answer in DB:', noCorrectAnswerIds);
      }
      const percentage = Math.round((correct / totalQuestions) * 100);
      setScore(percentage);
      setWrongQuestionIds(wrongIds);
      setIsFinished(true);
    }
  }, [currentIndex, totalQuestions, questions, answers]);

  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!currentQuestion) return;
    if (answers[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }));
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    autoNextTimerRef.current = setTimeout(() => {
      handleNext();
    }, 1500);
  }, [currentQuestion, answers, handleNext]);

  const handlePrevious = useCallback(() => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setTestStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setScore(0);
    setWrongQuestionIds([]);
    setMistakeMode(false);
    setMistakeQueue([]);
    setMistakeFinished(false);
  }, []);

  const handleStartMistakeMode = useCallback(() => {
    setMistakeQueue(wrongQuestionIds);
    setMistakeInitialCount(wrongQuestionIds.length);
    setMistakeAnswer(null);
    setMistakeFinished(false);
    setMistakeMode(true);
    setIsFinished(false);
  }, [wrongQuestionIds]);

  const mistakeQuestion = useMemo(() => {
    if (!mistakeMode || mistakeQueue.length === 0) return null;
    return questions.find(q => q.id === mistakeQueue[0]) || null;
  }, [mistakeMode, mistakeQueue, questions]);

  const handleMistakeSelectAnswer = useCallback((answerId: string) => {
    if (!mistakeQuestion || mistakeAnswer) return;
    setMistakeAnswer(answerId);
    const correctAnswer = mistakeQuestion.answers.find(
      a => isAnswerCorrect(a.is_correct)
    );
    if (correctAnswer && answerId === correctAnswer.id) {
      setTimeout(() => {
        setMistakeQueue(prev => {
          const next = prev.slice(1);
          if (next.length === 0) {
            setMistakeFinished(true);
          }
          return next;
        });
        setMistakeAnswer(null);
      }, 1500);
    }
  }, [mistakeQuestion, mistakeAnswer]);

  const handleMistakeRetry = useCallback(() => {
    setMistakeAnswer(null);
  }, []);

  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/20">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t('Yakuniy Test', 'Финальный тест')}
          </h2>

          <p className="text-muted-foreground mb-4">
            {t('Рандом саволлар барча мавзулардан. Ҳар сафар саволлар ўзгаради.', 'Случайные вопросы из всех тем. Каждый раз вопросы новые.')}
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {QUESTION_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setQuestionCount(n)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
                  questionCount === n
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-foreground border-primary/30 hover:opacity-90'
                )}
              >
                {n}
              </button>
            ))}
          </div>
          {loadError && (
            <p className="text-sm text-destructive mb-4" role="alert">
              {loadError}
            </p>
          )}
          
          <div className="flex flex-col gap-3">
            <Button onClick={startTest} disabled={isLoadingQuestions} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {isLoadingQuestions ? t('Юкланмоқда...', 'Загрузка...') : t('Тестни бошлаш', 'Начать тест')}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('Орқага', 'Назад')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mistake mode finished screen
  if (mistakeMode && mistakeFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card border-success/50 animate-scale-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-success/20">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('Аъло!', 'Отлично!')}</h2>
          <p className="text-muted-foreground mb-8">
            {t('Барча хатолар устида ишладингиз.', 'Вы разобрали все ошибки.')}
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Бош саҳифага қайтиш', 'Вернуться на главную')}
          </Button>
        </div>
      </div>
    );
  }

  // Mistake mode question screen
  if (mistakeMode && mistakeQuestion) {
    const remaining = mistakeQueue.length;
    const fixed = mistakeInitialCount - remaining;
    const correctAnswer = mistakeQuestion.answers.find(
      a => isAnswerCorrect(a.is_correct)
    );
    const isWrong = mistakeAnswer !== null && mistakeAnswer !== correctAnswer?.id;

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('Орқага', 'Назад')}
            </Button>
            <span className="text-muted-foreground font-medium">
              {t('Xatolar ustida ishlash', 'Работа над ошибками')}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <ProgressBar current={fixed} total={mistakeInitialCount} className="flex-1" />
            <span className="text-sm text-muted-foreground shrink-0">
              {t('Қолди', 'Осталось')}: {remaining}/{mistakeInitialCount}
            </span>
          </div>

          <QuestionView
            question={mistakeQuestion}
            selectedAnswer={mistakeAnswer}
            onSelectAnswer={handleMistakeSelectAnswer}
          />

          {isWrong && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleMistakeRetry} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t('Яна уриниб кўриш', 'Попробовать снова')}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isFinished) {
    const passed = score >= 95;
    const canReviewMistakes = wrongQuestionIds.length > 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className={cn(
          "max-w-md w-full text-center p-8 rounded-2xl border-2 animate-scale-in",
          passed ? "bg-card border-success/50" : "bg-card border-destructive/50"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6",
            passed ? "bg-success/20" : "bg-destructive/20"
          )}>
            <Trophy className={cn(
              "w-10 h-10",
              passed ? "text-success" : "text-destructive"
            )} />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {passed ? t("Табриклаймиз!", "Поздравляем!") : t("Қайта уриниб кўринг", "Попробуйте ещё раз")}
          </h2>

          <p className="text-4xl font-bold mb-2" style={{
            color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
          }}>
            {score.toFixed(0)}%
          </p>

          <p className="text-muted-foreground mb-8">
            {passed
              ? t("Сиз Yakuniy Testни муваффақиятли топширдингиз!", "Вы успешно прошли финальный тест!")
              : t("Ўтиш учун 95% тўплашингиз керак", "Для прохождения нужно набрать 95%")}
          </p>

          <div className="flex flex-col gap-3">
            {canReviewMistakes && (
              <Button onClick={handleStartMistakeMode} className="w-full">
                <Wrench className="w-4 h-4 mr-2" />
                {t('Xatolar ustida ishlash', 'Работа над ошибками')}
              </Button>
            )}
            <Button onClick={handleRestart} variant={canReviewMistakes ? "outline" : "default"} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('Яна уриниб кўриш', 'Попробовать снова')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('Бош саҳифага қайтиш', 'Вернуться на главную')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('Саволлар топилмади', 'Вопросы не найдены')}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Орқага', 'Назад')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Орқага', 'Назад')}
          </Button>

          <span className="text-muted-foreground">
            {t('Yakuniy Test', 'Финальный тест')}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} className="flex-1" />
          <span className="text-sm text-muted-foreground shrink-0">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <QuestionNumbers
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          onSelect={(i) => {
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current);
              autoNextTimerRef.current = null;
            }
            setCurrentIndex(i);
          }}
        />

        <QuestionView
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] ?? null}
          onSelectAnswer={handleSelectAnswer}
        />

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Олдинги', 'Назад')}
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex >= totalQuestions - 1}
          >
            {t('Кейингиси', 'Далее')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default YakuniyTestPage;
