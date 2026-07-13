import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import LessonPage from "./pages/LessonPage";
import TopicVideoPage from "./pages/TopicVideoPage";
import TestPage from "./pages/TestPage";
import YakuniyTestPage from "./pages/YakuniyTestPage";
import ProfilePage from "./pages/ProfilePage";
import DuelPage from "./pages/DuelPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import FoydaliMalumotlarPage from "./pages/FoydaliMalumotlarPage";
import LegalPage from "./pages/LegalPage";
import { useAuth } from "./hooks/useAuth";
import { PresenceProvider } from "./hooks/usePresence";
import { CornerSwitch } from "./components/CornerSwitch";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 2,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('session_token'));
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <AuthenticatedContent>{children}</AuthenticatedContent>;
}

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  useAuth();
  return <>{children}</>;
}

// Root route: logged-out visitors always see the marketing landing page.
// Logged-in visitors go straight into the study app (least surprising,
// avoids re-prompting for login) unless they've manually flipped to the
// landing view via the corner switch.
function RootRoute() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    setHasSession(!!localStorage.getItem('session_token'));
  }, []);

  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Юкланмоқда...</div>
      </div>
    );
  }

  // Logged-out → marketing landing. Logged-in → straight into the study app.
  if (!hasSession) return <LandingPage />;

  return (
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  );
}

function GlobalCornerSwitch() {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!localStorage.getItem('session_token'));
    const onStorage = () => setHasSession(!!localStorage.getItem('session_token'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <CornerSwitch hasSession={hasSession} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <PresenceProvider>
        <GlobalCornerSwitch />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          {/* Registration is mandatory — old public preview routes now lead to sign-up. */}
          <Route path="/preview/lesson" element={<Navigate to="/auth" replace />} />
          <Route path="/preview/yakuniy" element={<Navigate to="/auth" replace />} />
          <Route path="/" element={<RootRoute />} />
          <Route path="/oferta" element={<LegalPage type="offer" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/duel/:duelId" element={
            <ProtectedRoute>
              <DuelPage />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          } />
          <Route path="/foydali-malumotlar" element={
            <ProtectedRoute>
              <FoydaliMalumotlarPage />
            </ProtectedRoute>
          } />
          <Route path="/lesson/:lessonId" element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          } />
          <Route path="/topic/:topicId/video" element={
            <ProtectedRoute>
              <TopicVideoPage />
            </ProtectedRoute>
          } />
          <Route path="/test/yakuniy/:topicId" element={
            <ProtectedRoute>
              <YakuniyTestPage />
            </ProtectedRoute>
          } />
          <Route path="/test/:topicId" element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </PresenceProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
