import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, RotateCcw } from 'lucide-react';
import { useTopic, useQuestionsWithAnswers } from '@/hooks/useSupabase';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { setTopicProgress, setActiveTopic, clearActiveTopic } from '@/lib/progress';
import { getImageUrl } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TestPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const { data: topic } = useTopic(topicId);
  const { data: questions, isLoading } = useQuestionsWithAnswers(topicId);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Set this topic as active when entering the test
  useEffect(() => {
    if (topicId) {
      setActiveTopic(topicId);
    }
  }, [topicId]);

  // Preload all question images when questions are loaded
  useEffect(() => {
    if (questions && questions.length > 0) {
      questions.forEach(question => {
        if (question.image_path) {
          const img = new Image();
          img.src = getImageUrl(question.image_path) || '';
        }
      });
    }
  }, [questions]);

  const questionsArray = questions || [];
  const currentQuestion = questionsArray[currentIndex];
  const totalQuestions = questionsArray.length;

  const handleSelectAnswer = useCallback((answerId: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answerId }));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Calculate score
      let correct = 0;
      questionsArray.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers.find(a => a.is_correct);
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) {
          correct++;
        }
      });
      
      const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
      setScore(percentage);
      setTopicProgress(topicId!, percentage);
      setIsFinished(true);
    }
  }, [currentIndex, totalQuestions, questionsArray, answers, topicId]);

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
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
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
              ? "Сиз кейинги мавзуга ўтишингиз мумкин!" 
              : "Ўтиш учун 95% тўплашингиз керак"}
          </p>
          
          <div className="flex flex-col gap-3">
            {!passed && (
              <Button onClick={handleRestart} className="w-full">
                <RotateCcw className="w-4 h-4 mr-2" />
                Қайта бошлаш
              </Button>
            )}
            <Button 
              variant={passed ? "default" : "outline"} 
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
          
          <span className="text-muted-foreground">
            {topic?.title_uz_cyr}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} className="flex-1" />
          <span className="text-sm text-muted-foreground shrink-0">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* Question */}
        <QuestionView
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] ?? null}
          onSelectAnswer={handleSelectAnswer}
        />

        {/* Navigation */}
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
