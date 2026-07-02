import { useEffect, useState } from 'react';

// Lets a logged-in user manually flip between the marketing landing page
// and the study app via the corner switch, without touching their session.
type ViewMode = 'landing' | 'app';
const VIEW_KEY = 'view_mode';

export function useViewMode() {
  const [manualMode, setManualModeState] = useState<ViewMode | null>(
    () => (sessionStorage.getItem(VIEW_KEY) as ViewMode | null) ?? null,
  );

  useEffect(() => {
    if (manualMode) sessionStorage.setItem(VIEW_KEY, manualMode);
    else sessionStorage.removeItem(VIEW_KEY);
  }, [manualMode]);

  return { manualMode, setManualMode: setManualModeState };
}
