import { TopicProgress, Topic, Lesson } from '@/types/database';

const PROGRESS_KEY = 'pdd_progress';
const ACTIVE_TOPIC_KEY = 'pdd_active_topic';

export function getProgress(): Record<string, TopicProgress> {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getTopicProgress(topicId: string): TopicProgress | null {
  const progress = getProgress();
  return progress[topicId] || null;
}

export function setTopicProgress(topicId: string, score: number): void {
  const progress = getProgress();
  const existing = progress[topicId];
  
  const bestScore = existing ? Math.max(existing.bestScore, score) : score;
  const completed = bestScore >= 95;
  
  progress[topicId] = {
    topicId,
    bestScore,
    completed,
  };
  
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  
  // Clear active topic if passed
  if (completed) {
    clearActiveTopic();
  }
}

export function getActiveTopic(): string | null {
  try {
    return localStorage.getItem(ACTIVE_TOPIC_KEY);
  } catch {
    return null;
  }
}

export function setActiveTopic(topicId: string): void {
  localStorage.setItem(ACTIVE_TOPIC_KEY, topicId);
}

export function clearActiveTopic(): void {
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
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(ACTIVE_TOPIC_KEY);
}

// ===== SEQUENTIAL UNLOCKING LOGIC =====

// Check if a specific topic is unlocked (based on sequential order)
export function isTopicUnlocked(
  topicId: string,
  allTopics: Topic[],
  allLessons: Lesson[]
): boolean {
  if (allTopics.length === 0 || allLessons.length === 0) return false;
  
  const progress = getProgress();
  
  // Sort lessons by order_index
  const sortedLessons = [...allLessons].sort((a, b) => a.order_index - b.order_index);
  
  // Build ordered list of all topics across all lessons
  const orderedTopics: Topic[] = [];
  for (const lesson of sortedLessons) {
    const lessonTopics = allTopics
      .filter(t => t.lesson_id === lesson.id)
      .sort((a, b) => a.order_index - b.order_index);
    orderedTopics.push(...lessonTopics);
  }
  
  // First topic is always unlocked
  if (orderedTopics.length > 0 && orderedTopics[0].id === topicId) {
    return true;
  }
  
  // Find the topic index
  const topicIndex = orderedTopics.findIndex(t => t.id === topicId);
  if (topicIndex === -1) return false;
  
  // Check if all previous topics are completed with 95%+
  for (let i = 0; i < topicIndex; i++) {
    const prevTopicProgress = progress[orderedTopics[i].id];
    if (!prevTopicProgress || prevTopicProgress.bestScore < 95) {
      return false;
    }
  }
  
  return true;
}

// Check if a specific lesson is unlocked - ALL LESSONS ARE NOW ALWAYS UNLOCKED
export function isLessonUnlocked(
  lessonId: string,
  allTopics: Topic[],
  allLessons: Lesson[]
): boolean {
  return true; // All lessons are always open
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

