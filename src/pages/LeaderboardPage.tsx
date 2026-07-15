import { useNavigate } from 'react-router-dom';
import { Trophy, Loader2, Swords, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/PageShell';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useLeaderboard, useDuelList, useChallengeFriend, useRespondDuel } from '@/hooks/useDuels';
import { useFriendsList } from '@/hooks/useFriends';
import { useOnlineUsers } from '@/hooks/usePresence';
import { cn } from '@/lib/utils';
import { safeStorage } from '@/lib/safeStorage';

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: rows, isLoading } = useLeaderboard();
  const myUserId = safeStorage.getItem('user_id');

  const { data: friendsData } = useFriendsList();
  const onlineIds = useOnlineUsers();
  const { data: duelData } = useDuelList();
  const challengeFriend = useChallengeFriend();
  const respondDuel = useRespondDuel();

  const handleChallenge = (targetLogin: string) => {
    challengeFriend.mutate(targetLogin, {
      onSuccess: (data) => navigate(`/duel/${data.duel_id}`),
      onError: () => toast({ title: 'Хатолик', description: 'Чақирувни юбориб бўлмади', variant: 'destructive' }),
    });
  };

  const handleAcceptDuel = (duelId: string) => {
    respondDuel.mutate({ duelId, accept: true }, { onSuccess: () => navigate(`/duel/${duelId}`) });
  };

  return (
    <PageShell title="Турнир" icon={<Trophy className="w-5 h-5 text-primary" />} onBack={() => navigate(-1)}>
      <div className="grid md:grid-cols-2 gap-5 items-start mb-6">
      {(duelData?.incoming?.length ?? 0) > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-bold text-foreground mb-4 font-display">Мусобақа чақирувлари</h2>
          <div className="space-y-2">
            {duelData!.incoming.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={d.opponent_user.avatar_url ?? undefined} />
                    <AvatarFallback>{d.opponent_user.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{d.opponent_user.login} сизни мусобақага чақирди</span>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleAcceptDuel(d.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={() => respondDuel.mutate({ duelId: d.id, accept: false })}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(duelData?.outgoing?.length ?? 0) > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-bold text-foreground mb-4 font-display">Юборилган чақирувлар</h2>
          <div className="space-y-2">
            {duelData!.outgoing.map((d) => (
              <button
                key={d.id}
                className="flex items-center gap-2 w-full text-left"
                onClick={() => navigate(`/duel/${d.id}`)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={d.opponent_user.avatar_url ?? undefined} />
                  <AvatarFallback>{d.opponent_user.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {d.opponent_user.login} жавобини кутмоқда...
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(duelData?.active?.length ?? 0) > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <h2 className="font-bold text-foreground mb-4 font-display">Давом этаётган мусобақалар</h2>
          <div className="space-y-2">
            {duelData!.active.map((d) => (
              <button
                key={d.id}
                className="flex items-center gap-2 w-full text-left"
                onClick={() => navigate(`/duel/${d.id}`)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={d.opponent_user.avatar_url ?? undefined} />
                  <AvatarFallback>{d.opponent_user.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{d.opponent_user.login} билан мусобақа давом этмоқда</span>
              </button>
            ))}
          </div>
        </div>
      )}
      </div>

      {/* challenge friends — full width, matching the leaderboard table */}
      <div className="glass-card rounded-3xl p-6 mb-6">
        <h2 className="font-bold text-foreground mb-4 font-display">Дўстларни мусобақага чақириш</h2>
        {(friendsData?.friends?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            Дўстларингиз йўқ — аввал профилда дўст қўшинг
          </p>
        ) : (
          <div className="space-y-2">
            {friendsData!.friends.map((f) => {
              const isOnline = onlineIds.has(f.id);
              return (
                <div key={f.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={f.avatar_url ?? undefined} />
                        <AvatarFallback>{f.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                          isOnline ? 'bg-green-500' : 'bg-muted-foreground/40'
                        }`}
                      />
                    </div>
                    <span className="text-sm text-foreground">{f.login}</span>
                    <span className="text-xs text-muted-foreground">{isOnline ? 'онлайн' : 'офлайн'}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!isOnline || challengeFriend.isPending}
                    onClick={() => handleChallenge(f.login)}
                  >
                    <Swords className="w-4 h-4 mr-1" />
                    Мусобақа
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <h2 className="font-bold text-foreground mb-4 font-display px-1">Турнир жадвали</h2>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (rows?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ҳали мусобақалар ўтказилмаган</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl divide-y divide-border/40 overflow-hidden">
          {rows!.map((row, index) => {
            const isOnline = onlineIds.has(row.user_id);
            return (
            <div
              key={row.user_id}
              className={cn(
                'flex items-center gap-3.5 p-5',
                row.user_id === myUserId && 'bg-primary/10',
              )}
            >
              <span
                className={cn(
                  'w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black tabular-nums',
                  index === 0 && 'bg-[hsl(45_92%_55%/0.18)] text-[hsl(45_92%_55%)] ring-1 ring-[hsl(45_92%_55%/0.5)]',
                  index === 1 && 'bg-[hsl(220_9%_70%/0.18)] text-[hsl(220_9%_78%)] ring-1 ring-[hsl(220_9%_70%/0.4)]',
                  index === 2 && 'bg-[hsl(25_75%_55%/0.18)] text-[hsl(25_75%_60%)] ring-1 ring-[hsl(25_75%_55%/0.4)]',
                  index > 2 && 'text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              <div className="relative shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={row.avatar_url ?? undefined} />
                  <AvatarFallback>{row.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
                    isOnline ? 'bg-success' : 'bg-muted-foreground/40',
                  )}
                  title={isOnline ? 'онлайн' : 'офлайн'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-foreground truncate">{row.login}</p>
                <p className="text-xs text-muted-foreground">{row.battles} та мусобақа</p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-xl font-black text-foreground leading-none tabular-nums">{row.correct_answers}</p>
                <p className="text-[10px] text-muted-foreground mt-1">тўғри жавоб</p>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
};

export default LeaderboardPage;
