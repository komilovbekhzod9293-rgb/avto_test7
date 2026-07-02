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
