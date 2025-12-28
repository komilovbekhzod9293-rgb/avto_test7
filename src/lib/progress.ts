import { TopicProgress } from '@/types/database';

const PROGRESS_KEY = 'pdd_progress';
const ACTIVE_TOPIC_KEY = 'pdd_active_topic';
const FINAL_TEST_SCORES_KEY = 'pdd_final_test_scores';

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
  localStorage.removeItem(FINAL_TEST_SCORES_KEY);
}

// Check if user can access final test (95%+ on all topics)
export function canAccessFinalTest(allTopicIds: string[]): boolean {
  if (allTopicIds.length === 0) return false;
  
  const progress = getProgress();
  
  for (const topicId of allTopicIds) {
    const topicProgress = progress[topicId];
    if (!topicProgress || topicProgress.bestScore < 95) {
      return false;
    }
  }
  
  return true;
}

// Get overall progress percentage for final test access
export function getOverallProgress(allTopicIds: string[]): { completed: number; total: number; percentage: number } {
  if (allTopicIds.length === 0) return { completed: 0, total: 0, percentage: 0 };
  
  const progress = getProgress();
  let completed = 0;
  
  for (const topicId of allTopicIds) {
    const topicProgress = progress[topicId];
    if (topicProgress && topicProgress.bestScore >= 95) {
      completed++;
    }
  }
  
  return {
    completed,
    total: allTopicIds.length,
    percentage: (completed / allTopicIds.length) * 100,
  };
}

// Final test scores
export function getFinalTestScores(): number[] {
  try {
    const stored = localStorage.getItem(FINAL_TEST_SCORES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addFinalTestScore(score: number): void {
  const scores = getFinalTestScores();
  scores.push(score);
  localStorage.setItem(FINAL_TEST_SCORES_KEY, JSON.stringify(scores));
}

export function getBestFinalTestScore(): number {
  const scores = getFinalTestScores();
  return scores.length > 0 ? Math.max(...scores) : 0;
}
