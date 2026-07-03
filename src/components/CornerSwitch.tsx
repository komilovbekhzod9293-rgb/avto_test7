import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// Persistent corner control — theme toggle only.
// (The landing/app view switch was removed: it confused login and served no
// real purpose — logged-out visitors get the landing, logged-in get the app.)
export function CornerSwitch({ hasSession: _hasSession }: { hasSession: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        type="button"
        onClick={toggleTheme}
        className="glass-strong w-10 h-10 rounded-full flex items-center justify-center shadow-lg text-foreground"
        aria-label="Toggle theme"
        title="Тема"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}
