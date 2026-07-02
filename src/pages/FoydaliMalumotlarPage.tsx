import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTrafficSigns } from '@/hooks/useSupabase';
import type { TrafficSign } from '@/types/database';

// Fixed display order for categories.
const CATEGORY_ORDER = [
  'Ogohlantiruvchi belgilar',
  'Imtiyoz belgilari',
  'Taqiqlovchi belgilar',
  'Buyuruvchi belgilar',
  'Axborot belgilari',
  'Xizmat ko’rsatish belgilari',
  'Qo’shimcha axborot belgilari',
];

function SignThumb({ sign }: { sign: TrafficSign }) {
  return (
    <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center overflow-hidden">
      {sign.image_url ? (
        <img src={sign.image_url} alt={sign.title} className="w-full h-full object-contain p-3" loading="lazy" />
      ) : (
        <span className="text-muted-foreground text-xs">Расм йўқ</span>
      )}
    </div>
  );
}

function SignCard({ sign, onClick }: { sign: TrafficSign; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="p-4 rounded-xl border-2 border-primary/20 bg-card text-left card-hover transition-all">
      <div className="mb-3">
        <SignThumb sign={sign} />
      </div>
      <p className="text-primary font-semibold text-sm">{sign.number}</p>
    </button>
  );
}

const FoydaliMalumotlarPage = () => {
  const navigate = useNavigate();
  const { data: signs, isLoading } = useTrafficSigns();
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [openSign, setOpenSign] = useState<TrafficSign | null>(null);

  const categoriesWithPreview = useMemo(() => {
    const byCategory = new Map<string, TrafficSign[]>();
    for (const s of signs ?? []) {
      const list = byCategory.get(s.category) ?? [];
      list.push(s);
      byCategory.set(s.category, list);
    }
    return CATEGORY_ORDER.filter((name) => byCategory.has(name)).map((name) => {
      const list = byCategory.get(name)!;
      return { name, count: list.length, preview: list.find((s) => s.image_url) ?? list[0] };
    });
  }, [signs]);

  const filteredSigns = useMemo(() => {
    const all = signs ?? [];
    const query = search.trim().toLowerCase();
    const base = category ? all.filter((s) => s.category === category) : all;
    if (!query) return category ? base : [];
    return base.filter(
      (s) =>
        s.number.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    );
  }, [signs, category, search]);

  const showSignsGrid = category !== null || search.trim().length > 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => (category ? setCategory(null) : navigate('/'))}
            className="w-10 h-10 rounded-full border-2 border-primary/30 flex items-center justify-center text-foreground hover:bg-secondary/50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {category ?? "Foydali ma'lumotlar"}
          </h1>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="pl-10 h-12"
          />
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">Юкланмоқда...</div>
        ) : showSignsGrid ? (
          filteredSigns.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">Ҳеч нарса топилмади</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSigns.map((sign) => (
                <SignCard key={sign.id} sign={sign} onClick={() => setOpenSign(sign)} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesWithPreview.map(({ name, count, preview }) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className="p-4 rounded-xl border-2 border-primary/20 bg-card text-left card-hover transition-all"
              >
                <div className="w-full mb-3">
                  <SignThumb sign={preview} />
                </div>
                <h3 className="text-foreground font-semibold mb-1">{name}</h3>
                <p className="text-xs text-muted-foreground">{count} та белги</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!openSign} onOpenChange={(open) => !open && setOpenSign(null)}>
        <DialogContent>
          {openSign && (
            <>
              <DialogHeader>
                <DialogTitle>{openSign.number}</DialogTitle>
              </DialogHeader>
              <div className="w-40 mx-auto">
                <SignThumb sign={openSign} />
              </div>
              <p className="text-foreground font-semibold text-base">«{openSign.title}»</p>
              {openSign.description && openSign.description.trim() !== openSign.title.trim() && (
                <p className="text-muted-foreground text-sm">{openSign.description}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoydaliMalumotlarPage;
