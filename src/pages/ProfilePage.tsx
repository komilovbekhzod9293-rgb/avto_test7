import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { compressImageToJpeg, blobToBase64 } from '@/lib/imageCompress';
import { useFriendsList, useFriendSearch, useSendFriendRequest, useRespondFriendRequest } from '@/hooks/useFriends';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    localStorage.getItem('avatar_url')
  );

  const login = localStorage.getItem('login') ?? '';
  const { data: friendsData, isLoading: friendsLoading } = useFriendsList();
  const { data: searchResults, isLoading: searchLoading } = useFriendSearch(search);
  const sendRequest = useSendFriendRequest();
  const respondRequest = useRespondFriendRequest();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImageToJpeg(file);
      const base64 = await blobToBase64(compressed);

      const { data, error } = await invokeFunction<{ avatar_url: string }>('avatar-upload', {
        session_token: localStorage.getItem('session_token'),
        device_id: getDeviceId(),
        image_base64: base64,
      });

      if (error || !data) {
        toast({ title: 'Хатолик', description: 'Расмни юклаб бўлмади', variant: 'destructive' });
        return;
      }

      const newUrl = data.avatar_url;
      setAvatarUrl(newUrl);
      localStorage.setItem('avatar_url', newUrl);
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
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Профиль</h1>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex items-center gap-4">
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

      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <h2 className="font-medium text-foreground mb-3">Дўст қидириш</h2>
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
            <div className="bg-card rounded-2xl border border-border p-6 mb-6">
              <h2 className="font-medium text-foreground mb-3">Кирувчи сўровлар</h2>
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

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-medium text-foreground mb-3">Дўстлар</h2>
            {(friendsData?.friends?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Ҳали дўстларингиз йўқ</p>
            ) : (
              <div className="space-y-2">
                {friendsData!.friends.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={f.avatar_url ?? undefined} />
                      <AvatarFallback>{f.login.slice(0, 1).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{f.login}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
