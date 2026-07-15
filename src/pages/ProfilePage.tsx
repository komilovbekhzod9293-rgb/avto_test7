import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, UserPlus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/PageShell';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { compressImageToJpeg, blobToBase64 } from '@/lib/imageCompress';
import { useFriendsList, useFriendSearch, useSendFriendRequest, useRespondFriendRequest } from '@/hooks/useFriends';
import { useOnlineUsers } from '@/hooks/usePresence';
import { useUserStats } from '@/hooks/useUserStats';
import { safeStorage } from '@/lib/safeStorage';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    safeStorage.getItem('avatar_url')
  );

  const login = safeStorage.getItem('login') ?? '';
  const { data: friendsData, isLoading: friendsLoading } = useFriendsList();
  const { data: searchResults, isLoading: searchLoading } = useFriendSearch(search);
  const sendRequest = useSendFriendRequest();
  const respondRequest = useRespondFriendRequest();
  const onlineIds = useOnlineUsers();
  const { data: stats, isLoading: statsLoading } = useUserStats();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImageToJpeg(file);
      const base64 = await blobToBase64(compressed);

      const { data, error } = await invokeFunction<{ avatar_url: string }>('avatar-upload', {
        session_token: safeStorage.getItem('session_token'),
        device_id: getDeviceId(),
        image_base64: base64,
      });

      if (error || !data) {
        toast({ title: 'Хатолик', description: 'Расмни юклаб бўлмади', variant: 'destructive' });
        return;
      }

      const newUrl = data.avatar_url;
      setAvatarUrl(newUrl);
      safeStorage.setItem('avatar_url', newUrl);
      toast({ title: 'Муваффақият', description: 'Расм юкланди' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSendRequest = (targetLogin: string) => {
    sendRequest.mutate(targetLogin, {
      onSuccess: () => toast({ title: 'Юборилди', description: 'Дўстлик сўрови юборилди' }),
      onError: () => toast({ title: 'Хатолик', description: 'Сўровни юбориб бўлмади', variant: 'destructive' }),
    });
  };

  return (
    <PageShell
      title="Профиль"
      actions={
        <Button variant="ghost" size="sm" className="rounded-full font-semibold" onClick={() => navigate('/leaderboard')}>
          <Trophy className="w-4 h-4 mr-1.5 text-primary" />
          <span className="hidden sm:inline">Турнир</span>
        </Button>
      }
    >
      <div className="glass-card rounded-3xl p-6 mb-5 flex items-center gap-4">
        <label className="cursor-pointer relative">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback className="text-2xl">{login.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
        </label>
        <div>
          <p className="font-medium text-foreground">{login}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Расм катта бўлса, аввал Телеграмга сақлаб, қайта юклаб олинг — шунда файл автоматик кичрайтирилади
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-5">
        <h2 className="font-bold text-foreground mb-4 font-display">Менинг натижаларим</h2>
        {statsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-foreground">{stats?.tests_taken ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Ечилган тестлар</p>
            </div>
            <div>
              <p className="text-3xl font-black text-success">{stats?.correct_answers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Тўғри жавоблар</p>
            </div>
            <div>
              <p className="text-3xl font-black text-destructive">{stats?.wrong_answers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Хато жавоблар</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-bold text-foreground mb-4 font-display">Дўст қидириш</h2>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Логин бўйича қидириш"
          className="mb-3"
        />
        {searchLoading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
        <div className="space-y-2">
          {(searchResults ?? []).map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={u.avatar_url ?? undefined} />
                  <AvatarFallback>{u.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{u.login}</span>
              </div>
              {u.friendship_status === 'none' && (
                <Button size="sm" variant="outline" onClick={() => handleSendRequest(u.login)}>
                  <UserPlus className="w-4 h-4 mr-1" /> Қўшиш
                </Button>
              )}
              {u.friendship_status === 'pending_sent' && (
                <span className="text-xs text-muted-foreground">Сўров юборилган</span>
              )}
              {u.friendship_status === 'pending_received' && (
                <span className="text-xs text-muted-foreground">Сизга сўров бор</span>
              )}
              {u.friendship_status === 'accepted' && (
                <span className="text-xs text-muted-foreground">Дўстсиз</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {friendsLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <>
          {(friendsData?.incoming?.length ?? 0) > 0 && (
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-bold text-foreground mb-4 font-display">Кирувчи сўровлар</h2>
              <div className="space-y-2">
                {friendsData!.incoming.map((r) => (
                  <div key={r.friendship_id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={r.user.avatar_url ?? undefined} />
                        <AvatarFallback>{r.user.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground">{r.user.login}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => respondRequest.mutate({ friendshipId: r.friendship_id, accept: true })}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => respondRequest.mutate({ friendshipId: r.friendship_id, accept: false })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-bold text-foreground mb-4 font-display">Дўстлар</h2>
            {(friendsData?.friends?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Ҳали дўстларингиз йўқ</p>
            ) : (
              <div className="space-y-2">
                {friendsData!.friends.map((f) => {
                  const isOnline = onlineIds.has(f.id);
                  return (
                    <div key={f.id} className="flex items-center gap-2">
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
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </PageShell>
  );
};

export default ProfilePage;
