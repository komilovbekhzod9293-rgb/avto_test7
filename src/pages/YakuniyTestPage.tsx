import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, RotateCcw, Play } from 'lucide-react';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { getImageUrl, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { QuestionWithAnswers } from '@/types/database';

const YakuniyTestPage = () => {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const startTest = async () => {
    setIsLoadingQuestions(true);
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
    try {
      const { data, error } = await supabase.rpc('get_random_final_test_questions') as { data: any[], error: any };
      if (error) throw error;
      if (!data) throw new Error('No data returned');
      
      const questionsWithAnswers: QuestionWithAnswers[] = (data || []).map((q: any) => ({
        id: q.id,
        topic_id: q.topic_id,
        question_uz_cyr: q.question_uz_cyr,
        image_path: q.image_path,
        order_index: q.order_index,
        answers: Array.isArray(q.answers) ? q.answers : JSON.parse(q.answers || '[]')
      }));

      setQuestions(questionsWithAnswers);
      setTestStarted(true);
    } catch (err) {
      console.error('Error loading random questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Preload all question images when questions are loaded
  useEffect(() => {
    if (questions.length > 0) {
      questions.forEach(question => {
        if (question.image_path) {
          const img = new Image();
          img.src = getImageUrl(question.image_path) || '';
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
      // Calculate score
      let correct = 0;
      questions.forEach(q => {
        const selectedId = answers[q.id];
        const correctAnswer = q.answers.find(a => a.is_correct);
        if (selectedId && correctAnswer && selectedId === correctAnswer.id) {
          correct++;
        }
      });
      
      const percentage = Math.round((correct / totalQuestions) * 100);
      setScore(percentage);
      setIsFinished(true);
    }
  }, [currentIndex, totalQuestions, questions, answers]);

  const handlePrevious = useCallback(() => {
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
  }, []);

  // Initial screen before test starts
  if (!testStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/20">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Yakuniy Test
          </h2>
          
          <p className="text-muted-foreground mb-8">
            20 та рандом савол барча мавзулардан. Ҳар сафар саволлар ўзгаради.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={startTest} disabled={isLoadingQuestions} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {isLoadingQuestions ? 'Юкланмоқда...' : 'Тестни бошлаш'}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
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
              ? "Сиз Yakuniy Testни муваффақиятли топширдингиз!" 
              : "Ўтиш учун 95% тўплашингиз керак"}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={handleRestart} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Яна уриниб кўриш
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Бош саҳифага қайтиш
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
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Орқага
          </Button>
          
          <span className="text-muted-foreground">
            Yakuniy Test
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

export default YakuniyTestPage;
