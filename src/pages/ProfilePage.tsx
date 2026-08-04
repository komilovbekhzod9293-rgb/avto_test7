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
import { AccessExpiryBadge } from '@/components/AccessExpiryBadge';
import { useT } from '@/hooks/useT';

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
  const t = useT();

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
        toast({ title: t('Хатолик', 'Ошибка'), description: t('Расмни юклаб бўлмади', 'Не удалось загрузить фото'), variant: 'destructive' });
        return;
      }

      const newUrl = data.avatar_url;
      setAvatarUrl(newUrl);
      safeStorage.setItem('avatar_url', newUrl);
      toast({ title: t('Муваффақият', 'Успешно'), description: t('Расм юкланди', 'Фото загружено') });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSendRequest = (targetLogin: string) => {
    sendRequest.mutate(targetLogin, {
      onSuccess: () => toast({ title: t('Юборилди', 'Отправлено'), description: t('Дўстлик сўрови юборилди', 'Запрос в друзья отправлен') }),
      onError: () => toast({ title: t('Хатолик', 'Ошибка'), description: t('Сўровни юбориб бўлмади', 'Не удалось отправить запрос'), variant: 'destructive' }),
    });
  };

  return (
    <PageShell
      title={t('Профиль', 'Профиль')}
      actions={
        <Button variant="ghost" size="sm" className="rounded-full font-semibold" onClick={() => navigate('/leaderboard')}>
          <Trophy className="w-4 h-4 mr-1.5 text-primary" />
          <span className="hidden sm:inline">{t('Турнир', 'Турнир')}</span>
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
            {t(
              'Расм катта бўлса, аввал Телеграмга сақлаб, қайта юклаб олинг — шунда файл автоматик кичрайтирилади',
              'Если фото большое, сначала сохраните его в Телеграм и загрузите заново — так файл автоматически сожмётся'
            )}
          </p>
          <AccessExpiryBadge className="mt-2" />
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 mb-5">
        <h2 className="font-bold text-foreground mb-4 font-display">{t('Менинг натижаларим', 'Мои результаты')}</h2>
        {statsLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-black text-foreground">{stats?.tests_taken ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('Ечилган тестлар', 'Пройдено тестов')}</p>
            </div>
            <div>
              <p className="text-3xl font-black text-success">{stats?.correct_answers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('Тўғри жавоблар', 'Правильных ответов')}</p>
            </div>
            <div>
              <p className="text-3xl font-black text-destructive">{stats?.wrong_answers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('Хато жавоблар', 'Неправильных ответов')}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-5 items-start">
      <div className="glass-card rounded-3xl p-6">
        <h2 className="font-bold text-foreground mb-4 font-display">{t('Дўст қидириш', 'Поиск друзей')}</h2>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Логин бўйича қидириш', 'Поиск по логину')}
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
                  <UserPlus className="w-4 h-4 mr-1" /> {t('Қўшиш', 'Добавить')}
                </Button>
              )}
              {u.friendship_status === 'pending_sent' && (
                <span className="text-xs text-muted-foreground">{t('Сўров юборилган', 'Запрос отправлен')}</span>
              )}
              {u.friendship_status === 'pending_received' && (
                <span className="text-xs text-muted-foreground">{t('Сизга сўров бор', 'Вам пришёл запрос')}</span>
              )}
              {u.friendship_status === 'accepted' && (
                <span className="text-xs text-muted-foreground">{t('Дўстсиз', 'Вы друзья')}</span>
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
              <h2 className="font-bold text-foreground mb-4 font-display">{t('Кирувчи сўровлар', 'Входящие запросы')}</h2>
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
            <h2 className="font-bold text-foreground mb-4 font-display">{t('Дўстлар', 'Друзья')}</h2>
            {(friendsData?.friends?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">{t('Ҳали дўстларингиз йўқ', 'У вас пока нет друзей')}</p>
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
                      <span className="text-xs text-muted-foreground">{isOnline ? t('онлайн', 'онлайн') : t('офлайн', 'офлайн')}</span>
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
