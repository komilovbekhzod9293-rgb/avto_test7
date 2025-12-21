import { TopicProgress } from '@/types/database';

const PROGRESS_KEY = 'pdd_progress';

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
}

export function isTopicUnlocked(topicIndex: number, topics: { id: string }[]): boolean {
  if (topicIndex === 0) return true;
  
  const previousTopic = topics[topicIndex - 1];
  if (!previousTopic) return false;
  
  const progress = getTopicProgress(previousTopic.id);
  return progress?.completed ?? false;
}

export function resetProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}
