import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Trophy, Loader2, Swords } from 'lucide-react';
import { useQuestionsWithAnswers } from '@/hooks/useSupabase';
import { useDuel, useRespondDuel, useSubmitDuelResult } from '@/hooks/useDuels';
import { QuestionView } from '@/components/QuestionView';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionNumbers } from '@/components/QuestionNumbers';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn, isAnswerCorrect } from '@/lib/utils';

const DuelPage = () => {
  const { duelId } = useParams<{ duelId: string }>();
  const navigate = useNavigate();
  const { data: duel, isLoading } = useDuel(duelId);
  const respondDuel = useRespondDuel();
  const submitResult = useSubmitDuelResult();

  const { data: questions = [], isLoading: questionsLoading } = useQuestionsWithAnswers(
    duel && duel.status === 'active' && !duel.my_finished ? duel.topic_id : undefined
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleFinish = useCallback(
    (finalAnswers: Record<string, string>) => {
      let correct = 0;
      questions.forEach((q) => {
        const correctAnswer = q.answers.find((a) => isAnswerCorrect(a.is_correct));
        if (correctAnswer && finalAnswers[q.id] === correctAnswer.id) correct++;
      });
      if (duelId) {
        submitResult.mutate({ duelId, correctCount: correct, totalQuestions: questions.length });
      }
    },
    [questions, duelId, submitResult],
  );

  const handleSelectAnswer = useCallback(
    (answerId: string) => {
      if (!currentQuestion) return;
      const newAnswers = { ...answers, [currentQuestion.id]: answerId };
      setAnswers(newAnswers);
      if (currentIndex < totalQuestions - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 600);
      } else {
        setTimeout(() => handleFinish(newAnswers), 600);
      }
    },
    [currentQuestion, answers, currentIndex, totalQuestions, handleFinish],
  );

  useEffect(() => {
    setCurrentIndex(0);
    setAnswers({});
  }, [duel?.topic_id]);

  if (isLoading || !duel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (duel.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card animate-scale-in">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Swords className="w-10 h-10 text-primary" />
          </div>
          <Avatar className="w-14 h-14 mx-auto mb-3">
            <AvatarImage src={duel.opponent_user.avatar_url ?? undefined} />
            <AvatarFallback>{duel.opponent_user.login.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-foreground mb-6">
            {duel.opponent_user.login} билан мусобақа таклифи кутилмоқда...
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => respondDuel.mutate({ duelId: duelId!, accept: false })}>
              Бекор қилиш
            </Button>
          </div>
          <button className="mt-6 text-sm text-muted-foreground underline" onClick={() => navigate('/profile')}>
            Профилга қайтиш
          </button>
        </div>
      </div>
    );
  }

  if (duel.status === 'declined' || duel.status === 'cancelled') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card">
          <p className="text-foreground mb-6">Мусобақа бекор қилинди</p>
          <Button onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Профилга қайтиш
          </Button>
        </div>
      </div>
    );
  }

  if (duel.status === 'completed') {
    const won = duel.winner_id === localStorage.getItem('user_id');
    const isDraw = duel.winner_id === null;
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4">
        <div
          className={cn(
            'max-w-md w-full text-center p-8 rounded-2xl border-2 animate-scale-in',
            isDraw ? 'bg-card border-border' : won ? 'bg-card border-success/50' : 'bg-card border-destructive/50',
          )}
        >
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
              isDraw ? 'bg-muted' : won ? 'bg-success/20' : 'bg-destructive/20',
            )}
          >
            <Trophy className={cn('w-10 h-10', isDraw ? 'text-muted-foreground' : won ? 'text-success' : 'text-destructive')} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isDraw ? 'Дурранг!' : won ? 'Сиз ютдингиз! 🎉' : 'Сиз ютқаздингиз'}
          </h2>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Сиз</p>
              <p className="text-3xl font-bold text-foreground">{duel.my_score}</p>
            </div>
            <span className="text-muted-foreground">:</span>
            <div>
              <p className="text-sm text-muted-foreground">{duel.opponent_user.login}</p>
              <p className="text-3xl font-bold text-foreground">{duel.opponent_score}</p>
            </div>
          </div>
          <Button onClick={() => navigate('/leaderboard')} className="w-full mb-3">
            <Trophy className="w-4 h-4 mr-2" />
            Турнир жадвали
          </Button>
          <Button variant="outline" onClick={() => navigate('/profile')} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Профилга қайтиш
          </Button>
        </div>
      </div>
    );
  }

  // status === 'active'
  if (duel.my_finished && !duel.opponent_finished) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border-2 bg-card">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-6" />
          <p className="text-foreground mb-2">Сизнинг натижангиз: {duel.my_score}</p>
          <p className="text-muted-foreground">{duel.opponent_user.login} тугатишини кутмоқдамиз...</p>
        </div>
      </div>
    );
  }

  if (questionsLoading || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Swords className="w-4 h-4" />
            Мусобақа: {duel.opponent_user.login} билан
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} className="flex-1" />
          <span className="text-sm text-muted-foreground shrink-0">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <QuestionNumbers questions={questions} currentIndex={currentIndex} answers={answers} onSelect={() => {}} />

        <QuestionView
          question={currentQuestion}
          selectedAnswer={answers[currentQuestion.id] ?? null}
          onSelectAnswer={handleSelectAnswer}
        />

        <div className="flex justify-end mt-8">
          <Button variant="outline" disabled>
            Кейингиси
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuelPage;
