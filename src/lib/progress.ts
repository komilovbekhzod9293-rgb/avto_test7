import { useSyncExternalStore } from 'react';
import { TopicProgress, Topic, Lesson } from '@/types/database';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';

const PROGRESS_KEY = 'pdd_progress';
const ACTIVE_TOPIC_KEY = 'pdd_active_topic';

// In-memory cache hydrated once from the server after login. All the
// synchronous read functions below (called during render) read from this
// cache when it's hydrated, falling back to localStorage otherwise so the
// app keeps working before hydration completes.
let _cache: Record<string, TopicProgress> | null = null;
let _activeTopicCache: string | null | undefined = undefined;

// Reading _cache directly during render (as Index.tsx/TopicCard.tsx do) does
// NOT subscribe a component to later mutations. If hydrateProgressFromServer()
// resolves (e.g. right after logging in on a second device) after a
// component's first render, that component never re-renders with the
// downloaded data -- progress looks "not synced" until something unrelated
// happens to re-render it. useProgressVersion() gives components a value to
// subscribe to via useSyncExternalStore so they re-render exactly when it changes.
let _version = 0;
const _listeners = new Set<() => void>();

function bumpVersion(): void {
  _version++;
  _listeners.forEach((l) => l());
}

function subscribeProgress(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getProgressVersionSnapshot(): number {
  return _version;
}

// Call this (result unused) in any component that reads getProgress()/
// getTopicProgress()/getLessonProgress()/getActiveTopic() during render, so
// it re-renders when progress is hydrated from the server or updated locally.
export function useProgressVersion(): number {
  return useSyncExternalStore(subscribeProgress, getProgressVersionSnapshot);
}

function readLocalProgress(): Record<string, TopicProgress> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeLocalProgress(progress: Record<string, TopicProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function sessionArgs() {
  return {
    session_token: localStorage.getItem('session_token'),
    device_id: getDeviceId(),
  };
}

export async function hydrateProgressFromServer(): Promise<void> {
  const { session_token, device_id } = sessionArgs();
  if (!session_token) return;

  const { data, error } = await invokeFunction<{
    topic_progress: Record<
      string,
      { bestScore: number; completed: boolean; bestTimeSeconds: number | null; bestTimeQuestionCount: number | null }
    >;
    stats: { last_topic_id: string | null };
  }>('progress-sync', { action: 'get', session_token, device_id });
  if (error || !data) {
    console.error('hydrateProgressFromServer failed:', error);
    return;
  }

  const topicProgress: Record<string, TopicProgress> = {};
  for (const [topicId, tp] of Object.entries(data.topic_progress ?? {})) {
    topicProgress[topicId] = {
      topicId,
      bestScore: tp.bestScore,
      completed: tp.completed,
      bestTimeSeconds: tp.bestTimeSeconds,
      bestTimeQuestionCount: tp.bestTimeQuestionCount,
    };
  }

  _cache = topicProgress;
  _activeTopicCache = data.stats?.last_topic_id ?? null;
  writeLocalProgress(topicProgress);
  if (_activeTopicCache) localStorage.setItem(ACTIVE_TOPIC_KEY, _activeTopicCache);
  else localStorage.removeItem(ACTIVE_TOPIC_KEY);
  bumpVersion();
}

export async function migrateLocalProgressToServer(): Promise<void> {
  const local = readLocalProgress();
  const activeTopic = localStorage.getItem(ACTIVE_TOPIC_KEY);
  if (Object.keys(local).length === 0 && !activeTopic) return;

  const { session_token, device_id } = sessionArgs();
  if (!session_token) return;

  const localProgressPayload: Record<string, { bestScore: number; completed: boolean }> = {};
  for (const [topicId, tp] of Object.entries(local)) {
    localProgressPayload[topicId] = { bestScore: tp.bestScore, completed: tp.completed };
  }

  await invokeFunction('progress-sync', {
    action: 'migrate',
    session_token,
    device_id,
    local_progress: localProgressPayload,
    active_topic: activeTopic,
  });
}

export function getProgress(): Record<string, TopicProgress> {
  return _cache ?? readLocalProgress();
}

export function getTopicProgress(topicId: string): TopicProgress | null {
  const progress = getProgress();
  return progress[topicId] || null;
}

export function setTopicProgress(
  topicId: string,
  score: number,
  correctCount = 0,
  wrongCount = 0,
  timeSeconds?: number,
  questionCount?: number,
): void {
  const progress = getProgress();
  const existing = progress[topicId];

  const bestScore = existing ? Math.max(existing.bestScore, score) : score;
  const completed = bestScore >= 95;

  let bestTimeSeconds = existing?.bestTimeSeconds ?? null;
  let bestTimeQuestionCount = existing?.bestTimeQuestionCount ?? null;
  if (completed && typeof timeSeconds === 'number' && (bestTimeSeconds === null || timeSeconds < bestTimeSeconds)) {
    bestTimeSeconds = timeSeconds;
    bestTimeQuestionCount = questionCount ?? null;
  }

  const updated = { ...progress, [topicId]: { topicId, bestScore, completed, bestTimeSeconds, bestTimeQuestionCount } };
  _cache = updated;
  writeLocalProgress(updated);
  bumpVersion();

  if (completed) {
    clearActiveTopic();
  }

  const { session_token, device_id } = sessionArgs();
  if (session_token) {
    invokeFunction('progress-sync', {
      action: 'set-topic',
      session_token,
      device_id,
      topic_id: topicId,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      time_seconds: timeSeconds,
      question_count: questionCount,
    }).catch((err) => console.error('setTopicProgress sync failed:', err));
  }
}

export function getActiveTopic(): string | null {
  if (_activeTopicCache !== undefined) return _activeTopicCache;
  try {
    return localStorage.getItem(ACTIVE_TOPIC_KEY);
  } catch {
    return null;
  }
}

export function setActiveTopic(topicId: string): void {
  _activeTopicCache = topicId;
  localStorage.setItem(ACTIVE_TOPIC_KEY, topicId);
  bumpVersion();

  const { session_token, device_id } = sessionArgs();
  if (session_token) {
    invokeFunction('progress-sync', {
      action: 'set-active-location',
      session_token,
      device_id,
      topic_id: topicId,
    }).catch((err) => console.error('setActiveTopic sync failed:', err));
  }
}

export function clearActiveTopic(): void {
  _activeTopicCache = null;
  localStorage.removeItem(ACTIVE_TOPIC_KEY);
  bumpVersion();
}

export function canSelectTopic(topicId: string): boolean {
  const activeTopic = getActiveTopic();
  // No active topic - can select any
  if (!activeTopic) return true;
  // This is the active topic - can select
  if (activeTopic === topicId) return true;
  // Check if active topic is completed
  const activeProgress = getTopicProgress(activeTopic);
  if (activeProgress?.completed) {
    clearActiveTopic();
    return true;
  }
  return false;
}

export function resetProgress(): void {
  _cache = null;
  _activeTopicCache = undefined;
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(ACTIVE_TOPIC_KEY);
  bumpVersion();
}

// ===== IN-PROGRESS TEST SESSION (resume exactly where you left off) =====
// Unlike topic_progress (only written when a test is finished), this tracks
// the *current* question index and selected answers while a test is still
// running, tied to the account (user_id) via progress-sync/test_sessions --
// not localStorage -- so closing the app mid-test (even a 200-question
// Yakuniy run) and coming back later, or on another device, resumes exactly
// where the student left off instead of losing everything.

export interface TestSessionQuestion {
  id: string;
  topic_id: string;
  question_uz_cyr: string;
  image_path: string | null;
  image_url: string | null;
  order_index: number;
  answers: { id: string; question_id: string; answer_uz_cyr: string; is_correct: unknown }[];
}

export interface TestSession {
  testType: 'topic' | 'yakuniy';
  topicId: string | null;
  questionIds: string[] | null;
  answers: Record<string, string>;
  currentIndex: number;
  questionCount: number | null;
  // Only present for a 'yakuniy' session: the exact random question set that
  // was in progress, re-fetched by id so resuming doesn't draw a new random set.
  questions?: TestSessionQuestion[];
}

export async function getTestSession(): Promise<TestSession | null> {
  const { session_token, device_id } = sessionArgs();
  if (!session_token) return null;
  const { data, error } = await invokeFunction<{ session: TestSession | null }>('progress-sync', {
    action: 'get-session',
    session_token,
    device_id,
  });
  if (error || !data) return null;
  return data.session;
}

export function saveTestSession(params: {
  testType: 'topic' | 'yakuniy';
  topicId?: string | null;
  questionIds?: string[] | null;
  answers: Record<string, string>;
  currentIndex: number;
  questionCount?: number | null;
}): void {
  const { session_token, device_id } = sessionArgs();
  if (!session_token) return;
  invokeFunction('progress-sync', {
    action: 'save-session',
    session_token,
    device_id,
    test_type: params.testType,
    topic_id: params.topicId ?? null,
    question_ids: params.questionIds ?? null,
    answers: params.answers,
    current_index: params.currentIndex,
    question_count: params.questionCount ?? null,
  }).catch((err) => console.error('saveTestSession failed:', err));
}

export function clearTestSession(): void {
  const { session_token, device_id } = sessionArgs();
  if (!session_token) return;
  invokeFunction('progress-sync', { action: 'clear-session', session_token, device_id }).catch((err) =>
    console.error('clearTestSession failed:', err),
  );
}

// ===== SEQUENTIAL UNLOCKING LOGIC =====

// Check if a specific topic is unlocked (based on sequential order WITHIN each lesson)
export function isTopicUnlocked(
  topicId: string,
  allTopics: Topic[],
  allLessons: Lesson[]
): boolean {
  if (allTopics.length === 0 || allLessons.length === 0) return false;

  const progress = getProgress();

  // Find the topic
  const topic = allTopics.find(t => t.id === topicId);
  if (!topic) return false;

  // Get all topics in the same lesson, sorted by order_index
  const lessonTopics = allTopics
    .filter(t => t.lesson_id === topic.lesson_id)
    .sort((a, b) => a.order_index - b.order_index);

  // First topic in the lesson is always unlocked
  if (lessonTopics.length > 0 && lessonTopics[0].id === topicId) {
    return true;
  }

  // Find the topic index within this lesson
  const topicIndex = lessonTopics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return false;

  // Check if all previous topics IN THIS LESSON are completed with 95%+
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicProgress = progress[lessonTopics[i].id];
    if (!prevTopicProgress || prevTopicProgress.bestScore < 95) {
      return false;
    }
  }

  return true;
}

// Check if a specific lesson is unlocked. All lessons, including Yakuniy
// Test, are always open.
export function isLessonUnlocked(
  _lessonId: string,
  _allTopics: Topic[],
  _allLessons: Lesson[]
): boolean {
  return true;
}

// Get lesson progress (how many topics completed with 95%+)
export function getLessonProgress(
  lessonId: string,
  allTopics: Topic[]
): { completed: number; total: number } {
  const progress = getProgress();
  const lessonTopics = allTopics.filter(t => t.lesson_id === lessonId);

  let completed = 0;
  for (const topic of lessonTopics) {
    const topicProgress = progress[topic.id];
    if (topicProgress && topicProgress.bestScore >= 95) {
      completed++;
    }
  }

  return { completed, total: lessonTopics.length };
}
