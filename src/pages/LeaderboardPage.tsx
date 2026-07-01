import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useLeaderboard } from '@/hooks/useDuels';
import { cn } from '@/lib/utils';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { data: rows, isLoading } = useLeaderboard();
  const myUserId = localStorage.getItem('user_id');

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Турнир жадвали
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (rows?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ҳали мусобақалар ўтказилмаган</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {rows!.map((row, index) => (
            <div
              key={row.user_id}
              className={cn(
                'flex items-center gap-3 p-4',
                row.user_id === myUserId && 'bg-primary/5',
              )}
            >
              <span className="w-6 text-center font-semibold text-muted-foreground">{index + 1}</span>
              <Avatar className="w-9 h-9">
                <AvatarImage src={row.avatar_url ?? undefined} />
                <AvatarFallback>{row.login.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{row.login}</p>
                <p className="text-xs text-muted-foreground">{row.battles} та мусобақа</p>
              </div>
              <span className="text-lg font-bold text-foreground">{row.correct_answers}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
