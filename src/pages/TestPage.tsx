import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Wrench, CheckCircle2 } from 'lucide-react';
import { useTopic, useQuestionsWithAnswers } from '@/hooks/useSupabase';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { setTopicProgress, setActiveTopic } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TestPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const { data: topic } = useTopic(topicId);
  const { data: questions = [], isLoading } = useQuestionsWithAnswers(topicId);
  
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

  useEffect(() => {
    if (topicId) {
      setActiveTopic(topicId);
    }
  }, [topicId]);

  // Preload all question images
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach(question => {
        const imageUrl = (question as any).image_url;
        if (imageUrl) {
          const img = new Image();
          img.src = imageUrl;
        }
      });
    }
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      let correct = 0;
      const wrongIds: string[] = [];
      questions.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers.find(a => a.is_correct === true || String(a.is_correct) === "true");
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) {
          correct++;
        } else {
          wrongIds.push(q.id);
        }
      });
      
      const percentage = Math.round((correct / totalQuestions) * 100);
      setScore(percentage);
      setWrongQuestionIds(wrongIds);
      setTopicProgress(topicId!, percentage);
      setIsFinished(true);
    }
  }, [currentIndex, totalQuestions, questions, answers, topicId]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    setScore(0);
    setWrongQuestionIds([]);
  }, []);

  const handleStartMistakeMode = useCallback(() => {
    setMistakeQueue(wrongQuestionIds);
    setMistakeInitialCount(wrongQuestionIds.length);
    setMistakeAnswer(null);
    setMistakeFinished(false);
    setMistakeMode(true);
    setIsFinished(false);
  }, [wrongQuestionIds]);

  // Current mistake question
  const mistakeQuestion = useMemo(() => {
    if (!mistakeMode || mistakeQueue.length === 0) return null;
    return questions.find(q => q.id === mistakeQueue[0]) || null;
  }, [mistakeMode, mistakeQueue, questions]);

  const handleMistakeSelectAnswer = useCallback((answerId: string) => {
    if (!mistakeQuestion || mistakeAnswer) return;
    setMistakeAnswer(answerId);
    const correctAnswer = mistakeQuestion.answers.find(
      a => a.is_correct === true || String(a.is_correct) === "true"
    );
    if (correctAnswer && answerId === correctAnswer.id) {
      // Correct → advance after short delay
      setTimeout(() => {
        setMistakeQueue(prev => {
          const next = prev.slice(1);
          if (next.length === 0) {
            setMistakeFinished(true);
          }
          return next;
        });
        setMistakeAnswer(null);
      }, 900);
    }
  }, [mistakeQuestion, mistakeAnswer]);

  const handleMistakeRetry = useCallback(() => {
    setMistakeAnswer(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Аъло!</h2>
          <p className="text-muted-foreground mb-8">
            Барча хатолар устида ишладингиз.
          </p>
          <Button
            onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Мавзуларга қайтиш
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
      a => a.is_correct === true || String(a.is_correct) === "true"
    );
    const isWrong = mistakeAnswer !== null && mistakeAnswer !== correctAnswer?.id;

    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Орқага
            </Button>
            <span className="text-muted-foreground font-medium">
              Xatolar ustida ishlash
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <ProgressBar current={fixed} total={mistakeInitialCount} className="flex-1" />
            <span className="text-sm text-muted-foreground shrink-0">
              Қолди: {remaining}/{mistakeInitialCount}
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
                Яна уриниб кўриш
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isFinished) {
    const passed = score >= 95;
    const canReviewMistakes = score >= 95 && score < 100 && wrongQuestionIds.length > 0;
    
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
              ? "Сиз кейинги мавзуга ўтишингиз мумкин!" 
              : "Ўтиш учун 95% тўплашингиз керак"}
          </p>
          
          <div className="flex flex-col gap-3">
            {canReviewMistakes && (
              <Button onClick={handleStartMistakeMode} className="w-full">
                <Wrench className="w-4 h-4 mr-2" />
                Xatolar ustida ishlash
              </Button>
            )}
            {!passed && (
              <Button onClick={handleRestart} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Қайта бошлаш
              </Button>
            )}
            <Button 
              variant={passed && !canReviewMistakes ? "default" : "outline"} 
              onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Мавзуларга қайтиш
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
          <Button variant="outline" onClick={() => navigate(-1)}>
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
            onClick={() => navigate(`/lesson/${topic?.lesson_id}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
          
          <span className="text-muted-foreground">
            {topic?.title_uz_cyr}
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

export default TestPage;
