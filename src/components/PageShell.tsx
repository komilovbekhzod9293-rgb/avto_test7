import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/landing/Logo';

// Shared premium shell for interior app pages (profile, leaderboard, …):
// ambient background + sticky glass header with back button, logo and title.
export function PageShell({
  title,
  icon,
  onBack,
  actions,
  children,
}: {
  title: string;
  icon?: ReactNode;
  onBack?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative">

      <div className="sticky top-0 z-30 px-3 sm:px-4 pt-3">
        <div className="max-w-4xl mx-auto glass-strong rounded-2xl px-2.5 sm:px-3 h-14 flex items-center gap-2">
          <button
            onClick={onBack ?? (() => navigate('/'))}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors shrink-0"
            aria-label="Orqaga"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-extrabold tracking-tight text-lg text-foreground flex items-center gap-2 flex-1 min-w-0">
            {icon}
            <span className="truncate">{title}</span>
          </h1>
          {actions}
          <Logo height={22} className="ml-1 opacity-80 hidden sm:block" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
