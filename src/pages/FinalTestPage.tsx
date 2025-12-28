import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Lock } from 'lucide-react';
import { useLessons, useAllTopics, useAllQuestionsWithAnswers } from '@/hooks/useSupabase';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { canAccessFinalTest, getOverallProgress, addFinalTestScore, getBestFinalTestScore } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { QuestionWithAnswers } from '@/types/database';

const FINAL_TEST_QUESTION_COUNT = 40;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const FinalTestPage = () => {
  const navigate = useNavigate();
  
  const { data: lessons, isLoading: lessonsLoading } = useLessons();
  const { data: allTopics, isLoading: topicsLoading } = useAllTopics();
  const { data: allQuestions, isLoading: questionsLoading } = useAllQuestionsWithAnswers();
  
  const [testQuestions, setTestQuestions] = useState<QuestionWithAnswers[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  const allTopicIds = useMemo(() => allTopics?.map(t => t.id) || [], [allTopics]);
  const canAccess = canAccessFinalTest(allTopicIds);
  const overallProgress = getOverallProgress(allTopicIds);
  const bestScore = getBestFinalTestScore();

  const isLoading = lessonsLoading || topicsLoading || questionsLoading;

  const startTest = useCallback(() => {
    if (allQuestions && allQuestions.length > 0) {
      const shuffled = shuffleArray(allQuestions);
      const selected = shuffled.slice(0, Math.min(FINAL_TEST_QUESTION_COUNT, shuffled.length));
      setTestQuestions(selected);
      setTestStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      setIsFinished(false);
      setScore(0);
    }
  }, [allQuestions]);

  const currentQuestion = testQuestions[currentIndex];
  const totalQuestions = testQuestions.length;

  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      let correct = 0;
      testQuestions.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers.find(a => a.is_correct);
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) {
          correct++;
        }
      });
      
      const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
      setScore(percentage);
      addFinalTestScore(percentage);
      setIsFinished(true);
    }
  }, [currentIndex, totalQuestions, testQuestions, answers]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card border-warning/50 animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-warning/20">
            <Lock className="w-10 h-10 text-warning" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Якуний тест қулфланган
          </h2>
          
          <p className="text-muted-foreground mb-4">
            Якуний тестни очиш учун барча мавзуларда 95% ва ундан юқори натижа тўплашингиз керак.
          </p>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-warning mb-2">
              {overallProgress.completed}/{overallProgress.total}
            </div>
            <p className="text-sm text-muted-foreground">
              мавзу тугатилган ({overallProgress.percentage.toFixed(0)}%)
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Дарсларга қайтиш
          </Button>
        </div>
      </div>
    );
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card border-primary/50 animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/20">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Якуний тест
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {FINAL_TEST_QUESTION_COUNT} та рандом савол барча мавзулардан.
            Ҳар сафар саволлар ўзгаради.
          </p>
          
          {bestScore > 0 && (
            <p className="text-sm text-muted-foreground mb-6">
              Энг яхши натижангиз: <span className="font-bold text-success">{bestScore.toFixed(0)}%</span>
            </p>
          )}
          
          <div className="flex flex-col gap-3">
            <Button onClick={startTest} className="w-full">
              Тестни бошлаш
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

  if (isFinished) {
    const passed = score >= 95;
    
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
            {passed ? "Табриклаймиз!" : "Қайта уриниб кўринг"}
          </h2>
          
          <p className="text-4xl font-bold mb-2" style={{ 
            color: passed ? 'hsl(var(--success))' : 'hsl(var(--destructive))' 
          }}>
            {score.toFixed(0)}%
          </p>
          
          <p className="text-muted-foreground mb-8">
            {passed 
              ? "Сиз якуний тестни муваффақиятли топширдингиз!" 
              : "Ўтиш учун 95% тўплашингиз керак"}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={startTest} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Яна уриниб кўриш
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Дарсларга қайтиш
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
          <p className="text-muted-foreground mb-4">Саволлар топилмади</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
        </div>
      </div>
    );
  }

  const hasAnswered = !!answers[currentQuestion.id];

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
            Орқага
          </Button>
          
          <span className="text-muted-foreground font-medium">
            Якуний тест
          </span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} className="flex-1" />
          <span className="text-sm text-muted-foreground shrink-0">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

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
            Олдинги
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!hasAnswered}
          >
            {currentIndex === totalQuestions - 1 ? 'Тугатиш' : 'Кейинги'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalTestPage;
