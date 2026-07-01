import { useQuery } from '@tanstack/react-query';
import { invokeFunction } from '@/integrations/supabase/functionsClient';
import { getDeviceId } from '@/lib/deviceId';
import { clearSession } from '@/hooks/useAuth';
import type { Lesson, Topic, Question, Answer, QuestionWithAnswers } from '@/types/database';

async function fetchData(action: string, params: Record<string, string> = {}) {
  const session_token = localStorage.getItem('session_token');
  const device_id = getDeviceId();
  if (!session_token) {
    clearSession();
    if (typeof window !== 'undefined' && !window.location.hash.includes('/auth')) {
      window.location.hash = '#/auth';
    }
    throw new Error('Unauthorized: missing session');
  }
  const { data, error } = await invokeFunction('get-data', { action, ...params, session_token, device_id });
  if (error) throw new Error(error);
  return data;
}

export function useLessons() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: async (): Promise<Lesson[]> => {
      return (await fetchData('lessons')) || [];
    },
  });
}

export function useTopics(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['topics', lessonId],
    queryFn: async (): Promise<Topic[]> => {
      if (!lessonId) return [];
      return (await fetchData('topics', { lesson_id: lessonId })) || [];
    },
    enabled: !!lessonId,
  });
}

export function useAllTopics() {
  return useQuery({
    queryKey: ['all-topics'],
    queryFn: async (): Promise<Topic[]> => {
      return (await fetchData('all-topics')) || [];
    },
  });
}

export function useQuestions(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions', topicId],
    queryFn: async (): Promise<Question[]> => {
      if (!topicId) return [];
      return (await fetchData('questions', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useQuestionsWithAnswers(topicId: string | undefined) {
  return useQuery({
    queryKey: ['questions-with-answers', topicId],
    queryFn: async (): Promise<QuestionWithAnswers[]> => {
      if (!topicId) return [];
      return (await fetchData('questions-with-answers', { topic_id: topicId })) || [];
    },
    enabled: !!topicId,
  });
}

export function useLesson(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async (): Promise<Lesson | null> => {
      if (!lessonId) return null;
      return (await fetchData('lesson', { lesson_id: lessonId })) || null;
    },
    enabled: !!lessonId,
  });
}

export function useTopic(topicId: string | undefined) {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async (): Promise<Topic | null> => {
      if (!topicId) return null;
      return (await fetchData('topic', { topic_id: topicId })) || null;
    },
    enabled: !!topicId,
  });
}
