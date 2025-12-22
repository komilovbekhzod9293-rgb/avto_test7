import { TopicProgress } from '@/types/database';

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
