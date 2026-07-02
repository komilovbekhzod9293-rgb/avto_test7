import { Moon, Sun, Home, GraduationCap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useViewMode } from '@/hooks/useViewMode';
import { cn } from '@/lib/utils';

// Small persistent corner control: lets a logged-in visitor flip between the
// marketing landing page and the study app, and toggle light/dark theme.
// Always available, doesn't touch the session either way.
export function CornerSwitch({ hasSession }: { hasSession: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const { manualMode, setManualMode } = useViewMode();

  const currentView = manualMode ?? (hasSession ? 'app' : 'landing');

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {hasSession && (
        <div className="glass-strong rounded-full p-1 flex shadow-lg">
          <button
            type="button"
            onClick={() => setManualMode('landing')}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              currentView === 'landing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Landing"
            title="Лендинг"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setManualMode('app')}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
              currentView === 'app' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="App"
            title="Кабинет"
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>
      )}
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
