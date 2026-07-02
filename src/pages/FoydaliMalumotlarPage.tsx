import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, AlertTriangle, Diamond, Ban, ArrowUpCircle, Info, Wrench, Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTrafficSigns } from '@/hooks/useSupabase';
import type { TrafficSign } from '@/types/database';
import { cn } from '@/lib/utils';

// Fixed order + a simple icon per category -- deliberately not reusing any
// specific sign's photo as the category thumbnail, so this doesn't visually
// resemble the reference site's category picker.
const CATEGORY_ORDER: { name: string; icon: typeof Info; color: string }[] = [
  { name: 'Ogohlantiruvchi belgilar', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/15' },
  { name: 'Imtiyoz belgilari', icon: Diamond, color: 'text-yellow-500 bg-yellow-500/15' },
  { name: 'Taqiqlovchi belgilar', icon: Ban, color: 'text-destructive bg-destructive/15' },
  { name: 'Buyuruvchi belgilar', icon: ArrowUpCircle, color: 'text-primary bg-primary/15' },
  { name: 'Axborot belgilari', icon: Info, color: 'text-sky-500 bg-sky-500/15' },
  { name: 'Xizmat ko’rsatish belgilari', icon: Wrench, color: 'text-emerald-500 bg-emerald-500/15' },
  { name: 'Qo’shimcha axborot belgilari', icon: Layers, color: 'text-muted-foreground bg-muted/20' },
];

function SignCard({ sign }: { sign: TrafficSign }) {
  return (
    <div className="p-4 rounded-xl border-2 border-primary/20 bg-card">
      <div className="aspect-square rounded-lg bg-secondary/40 flex items-center justify-center mb-3 overflow-hidden">
        {sign.image_url ? (
          <img src={sign.image_url} alt={sign.title} className="w-full h-full object-contain p-3" loading="lazy" />
        ) : (
          <span className="text-muted-foreground text-xs">Расм йўқ</span>
        )}
      </div>
      <p className="text-primary font-semibold text-sm mb-1">{sign.number}</p>
      <p className="text-foreground text-sm">
        «{sign.title}»{sign.description ? `. ${sign.description}` : '.'}
      </p>
    </div>
  );
}

const FoydaliMalumotlarPage = () => {
  const navigate = useNavigate();
  const { data: signs, isLoading } = useTrafficSigns();
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categoriesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of signs ?? []) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return CATEGORY_ORDER.filter((c) => counts.has(c.name)).map((c) => ({ ...c, count: counts.get(c.name)! }));
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
                <SignCard key={sign.id} sign={sign} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoriesWithCounts.map(({ name, icon: Icon, color, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={cn(
                  'p-6 rounded-xl border-2 border-primary/20 bg-card text-left card-hover transition-all'
                )}
              >
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', color)}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-foreground font-semibold mb-1">{name}</h3>
                <p className="text-xs text-muted-foreground">{count} та белги</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoydaliMalumotlarPage;
